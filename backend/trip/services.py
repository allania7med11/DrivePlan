class TripPlanner:
    def __init__(self, current_location, pickup_location, dropoff_location, cycle_used_hours):
        self.current_location = current_location
        self.pickup_location = pickup_location
        self.dropoff_location = dropoff_location
        self.cycle_used_hours = cycle_used_hours

    def plan_trip(self):
        # Hardcoded trip plan
        legs = [
            {"from": "Chicago, IL", "to": "Indianapolis, IN", "driving_hours": 3},
            {"from": "Indianapolis, IN", "to": "St. Louis, MO", "driving_hours": 4},
        ]

        loading_time = 1
        unloading_time = 1

        start_time = 5
        activities = []
        current_time = start_time

        activities.append({"start": current_time, "end": current_time + legs[0]["driving_hours"], "type": "Driving"})
        current_time += legs[0]["driving_hours"]

        activities.append({"start": current_time, "end": current_time + loading_time, "type": "On Duty (Loading)"})
        current_time += loading_time

        activities.append({"start": current_time, "end": current_time + legs[1]["driving_hours"], "type": "Driving"})
        current_time += legs[1]["driving_hours"]

        activities.append({"start": current_time, "end": current_time + unloading_time, "type": "On Duty (Unloading)"})
        current_time += unloading_time

        activities.append({"start": current_time, "end": 24, "type": "Off Duty"})

        return {
            "legs": legs,
            "activities": activities
        }
