'use client';

import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Rest } from '@/types/trip';


type Props = {
  rests: {
    inputs: Rest[];
    duty_limit: Rest[];
    refill: Rest[];
  };
  routes: [number, number][][];
};

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [0, -36],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const reverse = ([lng, lat]: [number, number]): [number, number] => [lat, lng];

export default function MapView({ rests, routes }: Props) {
  // Flatten all rests into a single list with offsets by type
  const restTypes: { items: Rest[]; offset: [number, number] }[] = [
    { items: rests.inputs, offset: [0, -20] },
    { items: rests.duty_limit, offset: [0, 10] },
    { items: rests.refill, offset: [0, 30] },
  ];

  const markers = restTypes.flatMap(({ items, offset }) =>
    items.map((rest) => ({
      name: rest.name,
      coords: reverse(rest.coords),
      offset,
    }))
  );

  const center = markers[0]?.coords || [39.5, -98.35];

  return (
    <MapContainer
      center={center}
      zoom={6}
      style={{ height: '500px', width: '100%', borderRadius: '0.5rem' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url='https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      />

      {markers.map((marker, idx) => (
        <Marker key={idx} position={marker.coords} icon={markerIcon}>
          <Tooltip permanent direction="top" offset={marker.offset}>
            {marker.name}
          </Tooltip>
        </Marker>
      ))}

      {routes.map((route, idx) => (
        <Polyline
          key={idx}
          positions={route.map(([lon, lat]) => [lat, lon])}
          color="blue"
          weight={4}
          opacity={0.7}
          dashArray="6, 10"
        />
      ))}
    </MapContainer>
  );
}
