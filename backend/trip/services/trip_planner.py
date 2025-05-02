from functools import cached_property
from typing import Tuple, Dict, List, Any, Optional
from dataclasses import dataclass

from trip.services.map_client import MapClientProtocol
from trip.utils.time import round_down_to_15min, round_up_to_15min

MAX_DRIVE_HOURS_PER_DAY = 11
MAX_DUTY_HOURS_PER_DAY = 14
DUTY_LIMIT_REST_DURATION = 10
MAX_CYCLE_HOURS = 70
FUEL_MILES = 1000
KM_PER_MILE = 1.60934
FUEL_DISTANCE_KM = FUEL_MILES * KM_PER_MILE  # ≈1609.34 km
REFILL_DURATION_HOURS = 0.5

class DutyLimitExceeded(Exception):
    pass

@dataclass
class Leg:
    name: str
    drive_time: float
    distance: float
    load_time: float
    location: str
    info: str
    route: List[Tuple[float, float]]

    remain_drive: float = 0.0
    km_covered: float = 0.0
    km_covered_no_refill = 0.0

    def __post_init__(self):
        self.reset_tracking()

    def reset_tracking(self):
        self.remain_drive = self.drive_time
        self.km_covered = 0.0

    def compute_allowed_drive(self, driving_time: float, duty_time: float) -> float:
        max_drive = MAX_DRIVE_HOURS_PER_DAY - driving_time
        max_duty = MAX_DUTY_HOURS_PER_DAY - duty_time
        return min(max_drive, max_duty, self.remain_drive)
    
    def compute_allowed_drive_to_refill(self) -> float:
        # distance remain to get to FUEL_DISTANCE_KM without refill
        distance = FUEL_DISTANCE_KM - self.km_covered_no_refill
        raw_time = self.drive_time_for_distance(distance)
        return round_down_to_15min(raw_time)

    def drive_distance_for_allowed_drive(self, allowed_drive: float) -> float:
        return (allowed_drive / self.drive_time) * self.distance
    
    def drive_time_for_distance(self, distance: float) -> float:
        if self.distance == 0:
            return 0.0
        return (distance / self.distance) * self.drive_time

    def consume_allowed_drive(self, allowed_drive: float):
        self.remain_drive = max(0.0, self.remain_drive - allowed_drive)
        drive_distance = self.drive_distance_for_allowed_drive(allowed_drive)
        self.km_covered += drive_distance
        self.km_covered_no_refill += drive_distance
        
    def reset_km_covered_no_refill(self):
        self.km_covered_no_refill = 0.0
    
    def set_km_covered_no_refill(self, distance: float):
        self.km_covered_no_refill = distance

class TripPlanner:
    def __init__(
        self,
        current_location: str,
        pickup_location: str,
        dropoff_location: str,
        cycle_used_hours: float,
        map_client: MapClientProtocol,
        start_time: Optional[float] = 5,
    ):
        self.current_location = current_location
        self.pickup_location = pickup_location
        self.dropoff_location = dropoff_location
        self.cycle_used_hours = cycle_used_hours
        self.map_client = map_client
        self.start_time = start_time
        self.loading_time = round_up_to_15min(1)
        self.unloading_time = round_up_to_15min(1)

    @cached_property
    def coords(self) -> Dict[str, Tuple[float, float]]:
        resolved = self.map_client.batch_address_to_coords(
            [self.current_location, self.pickup_location, self.dropoff_location]
        )
        return {"current": resolved[0], "pickup": resolved[1], "dropoff": resolved[2]}

    @cached_property
    def coord_list(self):
        return [self.coords["current"], self.coords["pickup"], self.coords["dropoff"]]

    @cached_property
    def drive_times(self) -> Dict[str, float]:
        durations = self.map_client.durations_from_coords(self.coord_list)
        return {
            "leg1": round_up_to_15min(durations[0]),
            "leg2": round_up_to_15min(durations[1]),
        }

    @cached_property
    def leg_distances(self) -> Dict[str, float]:
        return {
            "leg1": self.map_client.get_total_distance(
                [self.coord_list[0], self.coord_list[1]]
            ),
            "leg2": self.map_client.get_total_distance(
                [self.coord_list[1], self.coord_list[2]]
            ),
        }

    @cached_property
    def route_geometries(self) -> List[List[Tuple[float, float]]]:
        return self.map_client.get_route_geometries(self.coord_list)

    def plan_trip(self) -> Dict[str, Any]:
        self._enforce_cycle_limit()
        rests, log_sheets = self._build_plan_trip()
        return {"rests": rests, "log_sheets": log_sheets, "routes": self.route_geometries}
    
    def _enforce_cycle_limit(self) -> None:
        """
        Raises DutyLimitExceeded if the sum of
        previous cycle hours + this trip's duty would go over MAX_CYCLE_HOURS.
        """
        total_duty = (
            self.drive_times["leg1"]
          + self.drive_times["leg2"]
          + self.loading_time
          + self.unloading_time
        )
        if self.cycle_used_hours + total_duty > MAX_CYCLE_HOURS:
            raise DutyLimitExceeded(
                f"Cycle would exceed {MAX_CYCLE_HOURS}h "
                f"(used {self.cycle_used_hours:.1f} + need {total_duty:.1f})"
            )



    def _build_plan_trip(self) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        legs = [
            Leg(
                "leg1",
                self.drive_times["leg1"],
                self.leg_distances["leg1"],
                self.loading_time,
                self.pickup_location,
                "Pickup",
                self.route_geometries[0],
            ),
            Leg(
                "leg2",
                self.drive_times["leg2"],
                self.leg_distances["leg2"],
                self.unloading_time,
                self.dropoff_location,
                "Dropoff",
                self.route_geometries[1],
            ),
        ]

        all_activities: List[Dict[str, Any]] = []
        all_remarks: List[Dict[str, Any]] = []
        current_time = self.start_time
        driving_time = duty_time = 0.0
        km_covered_no_refill = 0.0
        # ── add initial Off Duty if trip doesn't start at hour 0 ──
        current_time = self._add_start_off_duty(all_activities, current_time)

        for leg in legs:
            activities, remarks, current_time, driving_time, duty_time, km_covered_no_refill = self._process_leg(
                leg, current_time, driving_time, duty_time, km_covered_no_refill 
            )
            all_activities.extend(activities)
            all_remarks.extend(remarks)
            
        # ── add a single off-duty segment until next midnight ──
        current_time = self._add_end_of_day_rest(all_activities, current_time)

        rests = self._build_rests(all_remarks)
        log_sheets = self._slice_by_day(all_activities, all_remarks)
        return rests, log_sheets
    
    def _add_start_off_duty(
        self,
        all_activities: List[Dict[str, Any]],
        current_time: float
    ) -> float:
        """
        Adds an initial 'Off Duty' activity if the trip doesn't start at hour 0.
        Returns updated current_time (unchanged if no off duty was added).
        """
        if current_time > 0:
            all_activities.append({
                "start": 0.0,
                "end": current_time,
                "status": "Off Duty"
            })
        return current_time

    def _process_leg(
        self,
        leg: Leg,
        current_time: float,
        driving_time: float,
        duty_time: float,
        km_covered_no_refill: float, 
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], float, float, float]:
        activities: List[Dict[str, Any]] = []
        remarks: List[Dict[str, Any]] = []
        leg.reset_tracking()
        leg.set_km_covered_no_refill(km_covered_no_refill)

        while leg.remain_drive > 0:
            allowed_drive = leg.compute_allowed_drive(driving_time, duty_time)
            if allowed_drive <= 0:
                current_time, driving_time, duty_time = self._handle_off_duty_reset(
                    leg, current_time, remarks, activities
                )
                continue
            allowed_drive_to_refill = leg.compute_allowed_drive_to_refill()
            if allowed_drive > allowed_drive_to_refill:
                current_time, duty_time = self._handle_km_covered_no_refill(
                    leg, current_time,duty_time, remarks, activities
                )
                continue
            current_time, driving_time, duty_time = self._handle_drive_segment(
                leg, current_time, allowed_drive, driving_time, duty_time, activities
            )

        current_time, driving_time, duty_time = self._handle_leg_drive_time_completed(
            leg, current_time, driving_time, duty_time, remarks, activities
        )
        km_covered_no_refill = leg.km_covered_no_refill
        return activities, remarks, current_time, driving_time, duty_time, km_covered_no_refill

    def _handle_off_duty_reset(
        self,
        leg: Leg,
        current_time: float,
        remarks: List[Dict[str, Any]],
        activities: List[Dict[str, Any]],
    ) -> Tuple[float, float, float]:
        end = current_time + DUTY_LIMIT_REST_DURATION
        coord = self.map_client.interpolate_along_route(leg.route, leg.km_covered)
        loc = self.map_client.reverse_geocode(coord[1], coord[0])
        activities.append({"start": current_time, "end": end, "status": "Off Duty"})
        remarks.append(
            {
                "start": current_time,
                "end": end,
                "location": loc,
                "information": "Duty-Limit Rest",
                "coords": coord
            }
        )
        return end, 0.0, 0.0
    
    def _handle_km_covered_no_refill(
        self,
        leg: Leg,
        current_time: float,
        duty_time: float,
        remarks: List[Dict[str, Any]],
        activities: List[Dict[str, Any]],
    ) -> Tuple[float, float]:
        end = current_time + REFILL_DURATION_HOURS
        coord = self.map_client.interpolate_along_route(leg.route, leg.km_covered)
        loc = self.map_client.reverse_geocode(coord[1], coord[0])
        activities.append({"start": current_time, "end": end, "status": "On Duty"})
        remarks.append(
            {
                "start": current_time,
                "end": end,
                "location": loc,
                "information": "Fuel Refill",
                "coords": coord
            }
        )
        duty_time += REFILL_DURATION_HOURS
        leg.reset_km_covered_no_refill()
        return end, duty_time

    def _handle_drive_segment(
        self,
        leg: Leg,
        current_time: float,
        allowed_drive: float,
        driving_time: float,
        duty_time: float,
        activities: List[Dict[str, Any]],
    ) -> Tuple[float, float, float]:
        end = current_time + allowed_drive
        activities.append({"start": current_time, "end": end, "status": "Driving"})
        driving_time += allowed_drive
        duty_time += allowed_drive
        leg.consume_allowed_drive(allowed_drive)
        return end, driving_time, duty_time

    def _handle_leg_drive_time_completed(
        self,
        leg: Leg,
        current_time: float,
        driving_time: float,
        duty_time: float,
        remarks: List[Dict[str, Any]],
        activities: List[Dict[str, Any]],
    ) -> Tuple[float, float, float]:
        # enforce duty limit before load/unload
        if duty_time + leg.load_time > MAX_DUTY_HOURS_PER_DAY:
            current_time, driving_time, duty_time = self._handle_off_duty_reset(
                leg, current_time, remarks, activities
            )

        end = current_time + leg.load_time
        activities.append({"start": current_time, "end": end, "status": "On Duty"})
        remarks.append(
            {
                "start": current_time,
                "end": end,
                "location": leg.location,
                "information": leg.info,
            }
        )
        duty_time += leg.load_time
        return end, driving_time, duty_time
    
    def _add_end_of_day_rest(
        self,
        all_activities: List[Dict[str, Any]],
        current_time: float
    ) -> float:
        """
        Appends a single 'Off Duty' activity from current_time until next midnight.
        Returns the updated current_time at midnight.
        """
        end = (int(current_time / 24) + 1) * 24
        if current_time < end:
            all_activities.append({
                "start": current_time,
                "end":   end,
                "status": "Off Duty",
            })
        return end
    
    def _build_rests(self, all_remarks: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        rests = {
            "inputs": [
                {"name": "🚚 Current Location (Start)", "coords": self.coords["current"]},
                {"name": "📦 Pickup Location",           "coords": self.coords["pickup"]},
                {"name": "🌟 Dropoff Location",          "coords": self.coords["dropoff"]},
            ],
            "duty_limit": [],
            "refill": [],
        }

        for remark in all_remarks:
            info = remark.get("information")
            loc_name = remark.get("location", "Unknown")
            coords = remark.get("coords")
            if not coords:
                continue

            if info == "Duty-Limit Rest":
                rests["duty_limit"].append({
                    "name": f"🔄 {loc_name} (Duty-Limit Rest)",
                    "coords": coords,
                })
            elif info == "Fuel Refill":
                rests["refill"].append({
                    "name": f"⛽ {loc_name} (Fuel Refill)",
                    "coords": coords,
                })

        return rests


    def _slice_by_day(
        self, activities: List[Dict[str, Any]], remarks: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        log_sheets: List[Dict[str, Any]] = []
        day = 0
        while True:
            day_start = 24 * day
            day_end = day_start + 24
            day_acts = [
                a for a in activities if a["start"] < day_end and a["end"] > day_start
            ]
            if not day_acts:
                break

            day_rems = [
                r for r in remarks if r["start"] < day_end and r["end"] > day_start
            ]

            sheet_acts = []
            by_status: Dict[str, float] = {}
            total_minutes = 0.0

            for a in day_acts:
                start = max(a["start"], day_start)
                end = min(a["end"], day_end)
                duration = end - start
                sheet_acts.append(
                    {
                        "start": start - day_start,
                        "end": end - day_start,
                        "status": a["status"],
                    }
                )
                by_status[a["status"]] = by_status.get(a["status"], 0.0) + duration * 60
                total_minutes += duration * 60

            sheet_rems = [
                {
                    "start": max(r["start"], day_start) - day_start,
                    "end": min(r["end"], day_end) - day_start,
                    "location": r["location"],
                    "information": r["information"],
                }
                for r in day_rems
            ]

            log_sheets.append(
                {
                    "activities": sheet_acts,
                    "remarks": sheet_rems,
                    "total_hours_by_status": {
                        k: round(v / 60, 2) for k, v in by_status.items()
                    },
                    "total_hours": round(total_minutes / 60, 2),
                }
            )
            day += 1

        return log_sheets