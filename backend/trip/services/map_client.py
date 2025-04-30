from typing import Protocol, Tuple, List
import openrouteservice


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
