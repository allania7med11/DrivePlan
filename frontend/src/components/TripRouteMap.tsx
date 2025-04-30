"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

type Props = {
  coords: {
    current: [number, number];
    pickup: [number, number];
    dropoff: [number, number];
  };
};

export default function TripRouteMap({ coords }: Props) {
  const center = coords.current;

  const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  return (
    <MapContainer
      center={center}
      zoom={6}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={coords.current} icon={markerIcon}>
        <Popup>Current Location</Popup>
      </Marker>

      <Marker position={coords.pickup} icon={markerIcon}>
        <Popup>Pickup Location (Loading)</Popup>
      </Marker>

      <Marker position={coords.dropoff} icon={markerIcon}>
        <Popup>Dropoff Location (Unloading)</Popup>
      </Marker>

      <Polyline positions={[coords.current, coords.pickup, coords.dropoff]} color="blue" />
    </MapContainer>
  );
} 
