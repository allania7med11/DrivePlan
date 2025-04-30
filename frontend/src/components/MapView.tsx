'use client';

import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
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
  // reverse coords from [lng, lat] to [lat, lng] for Leaflet
  const reverse = ([lng, lat]: [number, number]): [number, number] => [lat, lng];

  const current = reverse(coords.current);
  const pickup = reverse(coords.pickup);
  const dropoff = reverse(coords.dropoff);

  const center = current;

  return (
    <MapContainer center={center} zoom={6} style={{ height: '500px', width: '100%' }} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      />

      <Marker position={current} icon={markerIcon}>
        <Popup>Current Location</Popup>
      </Marker>

      <Marker position={pickup} icon={markerIcon}>
        <Popup>Pickup Location (Loading)</Popup>
      </Marker>

      <Marker position={dropoff} icon={markerIcon}>
        <Popup>Dropoff Location (Unloading)</Popup>
      </Marker>

      {routes.map((route, idx) => (
        <Polyline
          key={idx}
          positions={route.map(([lon, lat]) => [lat, lon])}
          color='blue'
        />
      ))}
    </MapContainer>
  );
}
