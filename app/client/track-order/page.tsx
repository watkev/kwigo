"use client";

import LiveTrackingMap from "@/app/client/LiveTrackingMap"; // L'IMPORTATION DOIT POINTER VERS components/client
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TrackOrderPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Suivi de ma commande</h1>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Visualisez en temps réel la position de votre chauffeur sur la carte.
        </p>

        {/* Intégration du composant de carte */}
        <LiveTrackingMap />

        {/* Optionnel: Ajoutez ici d'autres informations de suivi si nécessaire */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Informations de suivi détaillées</h2>
          <p className="text-gray-700 dark:text-gray-300">
            *Les informations de suivi en temps réel pour une commande spécifique seront affichées ici une fois la fonctionnalité liée à une commande sélectionnée.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mt-2">
            Pour l'instant, la carte affiche une position simulée.
          </p>
        </div>
      </div>
    </div>
  );
}