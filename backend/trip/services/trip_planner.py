from functools import cached_property
from typing import Tuple, Dict, List, Any, Optional

from trip.services.map_client import MapClientProtocol
from trip.utils.time import get_current_time_rounded_up, round_up_to_15min


class DutyLimitExceeded(Exception):
    pass


class TripPlanner:
    def __init__(
        self,
        current_location: str,
        pickup_location: str,
        dropoff_location: str,
        cycle_used_hours: float,
        map_client: MapClientProtocol,
        start_time: Optional[float] = None
    ):
        self.current_location = current_location
        self.pickup_location = pickup_location
        self.dropoff_location = dropoff_location
        self.cycle_used_hours = cycle_used_hours
        self.map_client = map_client

        self.loading_time: float = round_up_to_15min(1)
        self.unloading_time: float = round_up_to_15min(1)
        self.start_time: float = start_time or get_current_time_rounded_up()

    def plan_trip(self) -> Dict[str, List[Dict[str, Any]]]:
        self._validate_duty_window()
        return {
            "legs": self._build_legs(),
            "activities": self._build_activities(),
            "coords": self.coords,
            "routes": self.route_geometries
        }

    @cached_property
    def coords(self) -> Dict[str, Tuple[float, float]]:
        resolved = self.map_client.batch_address_to_coords([
            self.current_location,
            self.pickup_location,
            self.dropoff_location
        ])
        return {
            "current": resolved[0],
            "pickup": resolved[1],
            "dropoff": resolved[2],
        }

    @cached_property
    def drive_times(self) -> Dict[str, float]:
        coord_list = [self.coords["current"], self.coords["pickup"], self.coords["dropoff"]]
        durations = self.map_client.durations_from_coords(coord_list)
        return {
            "leg1": round_up_to_15min(durations[0]),
            "leg2": round_up_to_15min(durations[1])
        }
    
    @cached_property
    def route_geometries(self) -> List[List[Tuple[float, float]]]:
        coord_list = [self.coords["current"], self.coords["pickup"], self.coords["dropoff"]]
        return self.map_client.get_route_geometries(coord_list)

    def _validate_duty_window(self) -> None:
        total_drive = self.drive_times["leg1"] + self.drive_times["leg2"]
        total_on_duty = self.loading_time + self.unloading_time
        total = self.cycle_used_hours + total_drive + total_on_duty
        if total > 14:
            raise DutyLimitExceeded(f"Trip would exceed duty limit: {total:.2f}h > 14h")

    def _build_legs(self) -> List[Dict[str, Any]]:
        return [
            {
                "from": self.current_location,
                "to": self.pickup_location,
                "driving_hours": self.drive_times["leg1"]
            },
            {
                "from": self.pickup_location,
                "to": self.dropoff_location,
                "driving_hours": self.drive_times["leg2"]
            }
        ]

    def _build_activities(self) -> List[Dict[str, Any]]:
        activities = []

        leg1_start = self.start_time
        leg1_end = leg1_start + self.drive_times["leg1"]
        activities.append({"start": leg1_start, "end": leg1_end, "type": "Driving"})

        load_start = leg1_end
        load_end = load_start + self.loading_time
        activities.append({"start": load_start, "end": load_end, "type": "On Duty (Loading)"})

        leg2_start = load_end
        leg2_end = leg2_start + self.drive_times["leg2"]
        activities.append({"start": leg2_start, "end": leg2_end, "type": "Driving"})

        unload_start = leg2_end
        unload_end = unload_start + self.unloading_time
        activities.append({"start": unload_start, "end": unload_end, "type": "On Duty (Unloading)"})

        if unload_end > 24:
            raise DutyLimitExceeded("Trip would extend past midnight.")

        activities.append({"start": unload_end, "end": 24, "type": "Off Duty"})

        return activities
