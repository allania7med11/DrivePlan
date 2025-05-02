from typing import Protocol, Tuple, List
import openrouteservice
import requests
from geopy.distance import geodesic

# Exceptions
class MapClientException(Exception): pass
class MapAPIError(MapClientException): pass
class InvalidAddressError(MapClientException): pass


# Interface / Protocol
class MapClientProtocol(Protocol):
    def batch_address_to_coords(self, addresses: List[str]) -> List[Tuple[float, float]]:
        """Resolve multiple addresses to (lon, lat) coordinates."""
        ...

    def durations_from_coords(self, locations: List[Tuple[float, float]]) -> List[float]:
        """Get durations in hours between each sequential pair of locations."""
        ...

    def get_route_geometries(self, locations: List[Tuple[float, float]]) -> List[List[Tuple[float, float]]]:
        """Get polyline geometry for each sequential pair of locations."""
        ...

    def get_total_distance(self, locations: List[Tuple[float, float]]) -> float:
        """Return total distance in kilometers between two points."""
        ...

    def interpolate_along_route(self, route: List[Tuple[float, float]], current_km: float) -> Tuple[float, float]:
        """Return coordinate (lon, lat) at a specific distance along the route."""
        ...

    def reverse_geocode(self, lat: float, lon: float) -> str:
        """Convert (lat, lon) to a readable location like 'City, State'."""
        ...


# Concrete implementation
class MapClient(MapClientProtocol):
    def __init__(self, api_key: str):
        self.client = openrouteservice.Client(key=api_key)

    def _address_to_coords(self, address: str) -> Tuple[float, float]:
        """Internal method to resolve one address to coordinates."""
        try:
            result = self.client.pelias_search(text=address)
            features = result.get("features", [])
            if not features:
                raise InvalidAddressError(f"Address not found: '{address}'")
            coords = features[0]['geometry']['coordinates']
            return tuple(coords)
        except InvalidAddressError:
            raise
        except Exception as e:
            raise MapAPIError(f"Failed to geocode address '{address}': {e}")

    def batch_address_to_coords(self, addresses: List[str]) -> List[Tuple[float, float]]:
        results = []
        for address in addresses:
            results.append(self._address_to_coords(address))
        return results

    def durations_from_coords(self, locations: List[Tuple[float, float]]) -> List[float]:
        """
        Get durations (in hours) between sequential points:
        duration[0] = from locations[0] to locations[1]
        duration[1] = from locations[1] to locations[2]
        ...
        """
        if len(locations) < 2:
            raise ValueError("At least two coordinates are required to compute durations.")

        try:
            matrix = self.client.distance_matrix(
                locations=locations,
                profile='driving-car',
                metrics=['duration'],
                resolve_locations=False,
            )
            durations_matrix = matrix['durations']
            return [
                durations_matrix[i][i + 1] / 3600
                for i in range(len(locations) - 1)
            ]
        except Exception as e:
            raise MapAPIError(f"Failed to get durations: {e}")
    
    def get_route_geometries(self, locations: List[Tuple[float, float]]) -> List[List[Tuple[float, float]]]:
        """
        Get list of route geometries between each pair of points.
        Each geometry is a list of (lon, lat) points forming a polyline.
        """
        if len(locations) < 2:
            raise ValueError("At least two coordinates are required to compute routes.")

        geometries = []

        try:
            for i in range(len(locations) - 1):
                start = locations[i]
                end = locations[i + 1]
                route = self.client.directions(
                    coordinates=[start, end],
                    profile='driving-car',
                    format='geojson'
                )
                coords = route['features'][0]['geometry']['coordinates']
                geometries.append(coords)
        except Exception as e:
            raise MapAPIError(f"Failed to get route geometry between {start} and {end}: {e}")

        return geometries
    
    def get_total_distance(self, locations: List[Tuple[float, float]]) -> float:
        try:
            matrix = self.client.distance_matrix(
                locations=locations,
                profile='driving-car',
                metrics=['distance'],
                resolve_locations=False,
            )
            distances_matrix = matrix['distances']
            return distances_matrix[0][1] / 1000  # meters to km
        except Exception as e:
            raise MapAPIError(f"Failed to get distance: {e}")
    
    def interpolate_along_route(self, route: List[Tuple[float, float]], current_km: float) -> Tuple[float, float]:
        if not route:
            raise ValueError("Route is empty")

        accumulated = 0.0
        for i in range(len(route) - 1):
            p1 = (route[i][1], route[i][0])
            p2 = (route[i+1][1], route[i+1][0])
            seg_km = geodesic(p1, p2).km
            if accumulated + seg_km >= current_km:
                ratio = (current_km - accumulated) / seg_km
                lon = route[i][0] + ratio * (route[i+1][0] - route[i][0])
                lat = route[i][1] + ratio * (route[i+1][1] - route[i][1])
                return (lon, lat)
            accumulated += seg_km

        return route[-1]  # fallback if over route
    
    def reverse_geocode(self, lat: float, lon: float) -> str:
        try:
            response = requests.get(
                "https://nominatim.openstreetmap.org/reverse",
                params={"lat": lat, "lon": lon, "format": "json"},
                headers={"User-Agent": "TripPlanner/1.0"}
            )
            data = response.json().get("address", {})
            city = data.get("city") or data.get("town") or data.get("village") or "Unknown"
            state = data.get("state") or "Unknown"
            return f"{city}, {state}"
        except Exception as e:
            return "Unknown Location"



