"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Important: Fix for Leaflet's default icon issues with Webpack/Next.js
import L from "leaflet";
// CORRECTION ICI : Assurez-vous que c'est _getIconUrl que vous supprimez
delete (L.Icon.Default.prototype as any)._getIconUrl; 
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Dynamically import Leaflet map components to prevent SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface LiveTrackingMapProps {
  orderId?: string; // Optionnel: ID de la commande pour un suivi spécifique
}

export default function LiveTrackingMap({ orderId }: LiveTrackingMapProps) {
  const [driverLocation, setDriverLocation] = useState<[number, number]>([
    3.848, 11.502,
  ]); // Default: Yaoundé
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- SIMULATION DE MISE À JOUR DE LOCALISATION DU CHAUFFEUR ---
    // En production, vous remplaceriez ceci par :
    // 1. Une écoute en temps réel de Firestore pour la position du chauffeur assigné à `orderId`.
    //    Ex: onSnapshot(doc(db, "drivers", driverId), (doc) => { setDriverLocation(doc.data().location) });
    // 2. Ou une API REST qui retourne la position actuelle du chauffeur.

    const simulateDriverMovement = () => {
      setDriverLocation((prev) => [
        prev[0] + (Math.random() - 0.5) * 0.005, // Petits mouvements aléatoires
        prev[1] + (Math.random() - 0.5) * 0.005,
      ]);
    };

    const interval = setInterval(simulateDriverMovement, 5000); // Met à jour toutes les 5 secondes
    setLoading(false); // Map is ready to be displayed with initial location

    return () => clearInterval(interval); // Nettoyage de l'intervalle
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="ml-2 text-gray-600">Chargement de la carte...</p>
      </div>
    );
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={driverLocation}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={driverLocation}>
          <Popup>Position actuelle du chauffeur</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}