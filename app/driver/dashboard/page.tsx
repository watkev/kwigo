// app/driver/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  MapPin,
  Clock,
  User,
  Settings,
  LogOut,
  CheckCircle,
  Eye,
  Calculator,
  Bot, // Importez l'icône Bot pour l'IA
  MessageCircle, // Importez l'icône MessageCircle pour l'IA
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getAvailableOrders, getOrdersByDriver, updateOrderStatus } from "@/lib/firestore";
import AINavigation from "@/components/ai/ai-navigation"; // <-- NOUVEL IMPORT : Composant AINavigation

// Define the Order type for better type safety
type Order = {
  id?: string;
  price?: number;
  from: string;
  to: string;
  description: string;
  weight: string | number;
  clientName: string;
  clientPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  recipientName: string;
  recipientPhone: string;
  status: string;
  createdAt: any;
  urgent?: boolean;
  fragile?: boolean;
  // Ajoutez d'autres champs si nécessaire (par exemple, driverId, driverName)
  driverId?: string;
  driverName?: string;
};

export default function DriverDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
      return;
    }

    // Redirection si l'utilisateur n'est pas un chauffeur
    if (user && user.role !== "driver") {
      // Optionnel: vous pouvez rediriger vers le tableau de bord client s'il existe
      // router.push("/client/dashboard");
      router.push("/auth/login"); // Ou une page d'erreur/non autorisé
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log("=== DÉBUT CHARGEMENT DONNÉES CHAUFFEUR ===");
      console.log("Utilisateur connecté:", user);

      // Load available orders
      console.log("Chargement des commandes disponibles...");
      let available = await getAvailableOrders();
      // Filtrer pour s'assurer que les prix sont valides avant de définir
      available = available.filter((order) => order.id && order.price != null && !isNaN(order.price));
      console.log("Commandes disponibles récupérées:", available);
      console.log("Nombre de commandes disponibles:", available.length);

      // Load my orders
      console.log("Chargement des commandes du chauffeur...");
      let myOrdersData = await getOrdersByDriver(user.uid);
      // Filtrer pour s'assurer que les prix sont valides avant de définir
      myOrdersData = myOrdersData.filter((order) => order.id && order.price != null && !isNaN(order.price));
      console.log("Mes commandes récupérées:", myOrdersData);
      console.log("Nombre de mes commandes:", myOrdersData.length);

      setAvailableOrders(available);
      setMyOrders(myOrdersData);

      console.log("=== FIN CHARGEMENT DONNÉES CHAUFFEUR ===");
    } catch (error: any) {
      console.error("=== ERREUR CHARGEMENT DONNÉES ===");
      console.error("Type d'erreur:", typeof error);
      console.error("Message d'erreur:", error.message);
      console.error("Code d'erreur:", error.code);
      console.error("Stack trace:", error.stack);
      console.error("Erreur complète:", error);

      toast({
        title: "Erreur",
        description: `Impossible de charger les commandes: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string | undefined) => {
    if (!user || !orderId) {
      toast({
        title: "Erreur",
        description: "Utilisateur non connecté ou ID de commande manquant.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Mettre à jour le statut, et assigner le chauffeur et son nom
      await updateOrderStatus(orderId, "accepted", user.uid, user.name);
      await loadData(); // Recharger les données pour rafraîchir les listes
      toast({
        title: "Commande acceptée",
        description: `Vous avez accepté la commande #${orderId.slice(-6)}.`,
      });
    } catch (error) {
      console.error("Erreur lors de l'acceptation:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'accepter la commande. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteOrder = async (orderId: string | undefined) => {
    if (!orderId) {
      toast({
        title: "Erreur",
        description: "ID de commande manquant.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateOrderStatus(orderId, "completed");
      await loadData(); // Recharger les données pour rafraîchir les listes
      toast({
        title: "Commande terminée",
        description: `La commande #${orderId.slice(-6)} a été marquée comme terminée.`,
      });
    } catch (error) {
      console.error("Erreur lors de la finalisation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de finaliser la commande. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const calculateCommission = (price: number | undefined | null) => {
    if (price == null || isNaN(price)) {
      return 0;
    }
    return Math.round(price * 0.15); // 15% commission
  };

  const calculateDriverEarnings = (price: number | undefined | null) => {
    if (price == null || isNaN(price)) {
      return 0;
    }
    return price - calculateCommission(price); // 85% for driver
  };

  const formatPrice = (price: number | undefined | null) => {
    if (price == null || isNaN(price)) {
      return "Prix indisponible";
    }
    return `${price.toLocaleString()} FCFA`;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Date non disponible";
    // Si c'est un objet Timestamp de Firebase, utilisez toDate()
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement des données du tableau de bord...</p>
        </div>
      </div>
    );
  }

  // Rediriger si l'utilisateur n'est pas un chauffeur ou non authentifié après chargement
  if (!user || user.role !== "driver") {
    return null; // ou un composant de chargement léger avant la redirection
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord Chauffeur</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">Bonjour, {user.name || "Utilisateur"}</span>
              <Button variant="outline" size="sm" onClick={() => router.push("/driver/profile")}>
                <User className="h-4 w-4 mr-2" />
                Profil
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/driver/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Assistant Card - NOUVELLE SECTION POUR L'IA */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-md">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center">
              <Bot className="h-10 w-10 text-blue-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assistant IA Personnel</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Obtenez des informations sur vos trajets, optimisez vos itinéraires et posez vos questions.
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/driver/ai-assistant")} // Assurez-vous que cette route existe
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Ouvrir l'assistant
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Commandes disponibles</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{availableOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mes commandes en cours</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {myOrders.filter((o) => o.status !== "completed").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Commandes terminées</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {myOrders.filter((o) => o.status === "completed").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Orders */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Commandes disponibles</CardTitle>
            <CardDescription>Nouvelles demandes de livraison en attente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableOrders.length > 0 ? (
                availableOrders.map((order) =>
                  order.id ? (
                    <div key={order.id} className="border rounded-lg p-6 bg-white dark:bg-gray-850 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">#{order.id.slice(-6)}</h3>
                          <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {order.from || "Non spécifié"} → {order.to || "Non spécifié"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="space-y-1">
                            <p className="text-xl font-bold text-green-600">{formatPrice(order.price)}</p>
                            <div className="text-sm space-y-1">
                              <div className="flex items-center text-blue-600">
                                <Calculator className="h-3 w-3 mr-1" />
                                <span>Vos gains: {formatPrice(calculateDriverEarnings(order.price))}</span>
                              </div>
                              <p className="text-red-600 text-xs">
                                Commission société: {formatPrice(calculateCommission(order.price))} (15%)
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2 mt-2 justify-end">
                            {order.urgent && <Badge variant="destructive">Urgent</Badge>}
                            {order.fragile && <Badge variant="secondary">Fragile</Badge>}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Description:</p>
                          <p className="text-gray-600 dark:text-gray-400">{order.description || "Non spécifié"}</p>
                          <p className="text-gray-600 dark:text-gray-400">Poids: {typeof order.weight === 'string' ? parseFloat(order.weight) : order.weight} kg</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Client:</p>
                          <p className="text-gray-600 dark:text-gray-400">{order.clientName || "Non spécifié"}</p>
                          <p className="text-gray-600 dark:text-gray-400">{order.clientPhone || "Non spécifié"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Collecte:</p>
                          <p className="text-gray-600 dark:text-gray-400">{order.pickupAddress || "Non spécifié"}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Livraison:</p>
                          <p className="text-gray-600 dark:text-gray-400">{order.deliveryAddress || "Non spécifié"}</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            Destinataire: {order.recipientName || "Non spécifié"} ({order.recipientPhone || "Non spécifié"})
                          </p>
                        </div>
                      </div>

                      <Button onClick={() => handleAcceptOrder(order.id)} className="w-full">
                        Accepter cette commande
                      </Button>
                    </div>
                  ) : null
                )
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Aucune commande disponible pour le moment.</p>
                  <Button className="mt-4" onClick={loadData}>
                    <Clock className="h-4 w-4 mr-2" /> {/* Changer l'icône pour Recharger */}
                    Recharger les commandes
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Mes commandes</CardTitle>
            <CardDescription>Commandes que vous avez acceptées ou terminées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myOrders.length > 0 ? (
                myOrders.map((order) =>
                  order.id ? (
                    <div key={order.id} className="border rounded-lg p-6 bg-white dark:bg-gray-850 shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">#{order.id.slice(-6)}</h3>
                          <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1 text-sm">
                            <MapPin className="h-4 w-4 mr-1" />
                            {order.from || "Non spécifié"} → {order.to || "Non spécifié"}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-600">{formatPrice(order.price)}</p>
                          <div className="text-xs space-y-1 mt-1">
                            <p className="text-blue-600 flex items-center justify-end">
                              <Calculator className="h-3 w-3 mr-1" /> Vos gains: {formatPrice(calculateDriverEarnings(order.price))}
                            </p>
                            <p className="text-red-600">Commission: {formatPrice(calculateCommission(order.price))}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Détails colis:</p>
                          <p className="text-gray-600 dark:text-gray-400">{order.description || "Non spécifié"}</p>
                          <p className="text-gray-600 dark:text-gray-400">Poids: {typeof order.weight === 'string' ? parseFloat(order.weight) : order.weight} kg</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Client:</p>
                          <p className="text-gray-600 dark:text-gray-400">{order.clientName || "Non spécifié"}</p>
                          <p className="text-gray-600 dark:text-gray-400">{order.clientPhone || "Non spécifié"}</p>
                        </div>
                      </div>

                      <div className="flex justify-end items-center space-x-2 mt-4">
                        {order.status === "completed" ? (
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Terminé
                          </Badge>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/driver/order/${order.id}`)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Voir les détails
                            </Button>
                            <Button size="sm" onClick={() => handleCompleteOrder(order.id)}>
                              Marquer comme terminé
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : null
                )
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Vous n'avez pas encore accepté de commandes.</p>
                  <Button className="mt-4" onClick={() => router.push("/driver/available-orders")}>
                    Voir les commandes disponibles
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* AI Navigation flottante - NOUVEL AJOUT */}
      {/* Assurez-vous que le composant AINavigation est correctement implémenté */}
      <AINavigation userRole="driver" />
    </div>
  );
}