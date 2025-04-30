"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function SimpleMap() {
  const coords: {
    current: [number, number];
    pickup: [number, number];
    dropoff: [number, number];
  } = {
    current: [41.87897, -87.66063], // Chicago
    pickup: [39.785871, -86.143448], // Indianapolis
    dropoff: [38.633024, -90.244086], // St. Louis
  };

  return (
    <MapContainer
      center={coords.current}
      zoom={6}
      scrollWheelZoom={true}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={coords.current} icon={markerIcon}>
        <Popup>Current Location: Chicago, IL</Popup>
      </Marker>

      <Marker position={coords.pickup} icon={markerIcon}>
        <Popup>Pickup Location: Indianapolis, IN</Popup>
      </Marker>

      <Marker position={coords.dropoff} icon={markerIcon}>
        <Popup>Dropoff Location: St. Louis, MO</Popup>
      </Marker>
    </MapContainer>
  );
}
