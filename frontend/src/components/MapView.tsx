'use client';

import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [0, -36],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

type Coords = {
  current: [number, number];
  pickup: [number, number];
  dropoff: [number, number];
};

type Props = {
  coords: Coords;
  routes: [number, number][][]; // list of route segments
};

export default function MapView({ coords, routes }: Props) {
  const reverse = ([lng, lat]: [number, number]): [number, number] => [lat, lng];

  const current = reverse(coords.current);
  const pickup = reverse(coords.pickup);
  const dropoff = reverse(coords.dropoff);

  const center = current;

  return (
    <MapContainer center={center} zoom={6} style={{ height: '500px', width: '100%', borderRadius: '0.5rem' }} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      />

      <Marker position={current} icon={markerIcon}>
        <Tooltip permanent direction="top" offset={[0, -15]}>
          🚚 Current Location (Start)
        </Tooltip>
      </Marker>

      <Marker position={pickup} icon={markerIcon}>
        <Tooltip permanent direction="top" offset={[0, -15]}>
          📦 Pickup Location (Loading)
        </Tooltip>
      </Marker>

      <Marker position={dropoff} icon={markerIcon}>
        <Tooltip permanent direction="top" offset={[0, -15]}>
          📤 Dropoff Location (Unloading)
        </Tooltip>
      </Marker>

      {routes.map((route, idx) => (
        <Polyline
          key={idx}
          positions={route.map(([lon, lat]) => [lat, lon])}
          color='blue'
          weight={4}
          opacity={0.7}
          dashArray='6, 10'
        />
      ))}
    </MapContainer>
  );
}
