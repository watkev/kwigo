// app/client/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  User as UserIcon, // Alias de l'icône User de lucide-react
  Settings,
  LogOut,
  Trash2,
  Eye,
  Bot,
  MessageCircle,
  MapPin,
  Truck,
  Zap, // Pour urgent
  Box, // Pour fragile
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getOrdersByClient, updateOrderStatus, type Order } from "@/lib/firestore";
import AINavigation from "@/components/ai/ai-navigation";
import { useAuth, type AppUser, type AuthContextType } from "@/app/providers/auth-provider";
import { getAuth } from "firebase/auth";
import { app } from "@/lib/firebase";

// Laissez ceci commenté si 'Order' est déjà bien défini dans "@/lib/firestore"
// type Order = {
//   id?: string;
//   price: number;
//   from: string;
//   to: string;
//   description: string;
//   weight: string | number;
//   clientName: string;
//   clientPhone: string;
//   pickupAddress: string;
//   deliveryAddress: string;
//   recipientName: string;
//   recipientPhone: string;
//   status: string;
//   createdAt: any;
//   urgent?: boolean;
//   fragile?: boolean;
//   driverName?: string;
//   driverId?: string;
// };

export default function ClientDashboard() {
  const { user, loadingAuth } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loadingAuth && (!user || user.role !== "client")) {
      router.push("/auth/login");
    }
  }, [user, loadingAuth, router]);

  useEffect(() => {
    if (user && user.role === "client" && !loadingAuth) {
      loadOrders();
    }
  }, [user, loadingAuth]);

  const loadOrders = async () => {
    if (!user || !user.uid) return;

    try {
      setLoadingOrders(true);
      setError(null);
      const userOrders = await getOrdersByClient(user.uid);
      setOrders(userOrders);
    } catch (error: any) {
      console.error("Erreur lors du chargement des commandes:", error);
      const errorMessage = error.message || "Impossible de charger vos commandes";
      setError(errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!orderId) return;

    try {
      setCancellingOrder(orderId);
      await updateOrderStatus(orderId, "cancelled");
      await loadOrders(); // Recharger les commandes pour mettre à jour l'UI
      toast({
        title: "Commande annulée",
        description: `La commande #${orderId.slice(-6)} a été annulée avec succès.`,
      });
    } catch (error: any) {
      console.error("Erreur lors de l'annulation:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la commande. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setCancellingOrder(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          // En attente: Gris doux, texte gris moyen
          <Badge variant="secondary" className="bg-muted text-muted-foreground border-border">
            <Clock className="h-3 w-3 mr-1 animate-pulse" />
            En attente
          </Badge>
        );
      case "accepted":
      case "in_progress":
        return (
          // En cours: Bleu primaire très léger, texte bleu primaire
          <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
            <Truck className="h-3 w-3 mr-1 animate-bounce" />
            En cours
          </Badge>
        );
      case "completed":
        return (
          // Terminé: Vert subtil (conservé pour la sémantique)
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Terminé
          </Badge>
        );
      case "cancelled":
        return (
          // Annulé: Rouge destructif léger, texte rouge destructif
          <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
            <XCircle className="h-3 w-3 mr-1" />
            Annulé
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
      return "Date invalide";
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FCFA`;
  };

  const handleLogout = () => {
    getAuth(app)
      .signOut()
      .then(() => {
        localStorage.removeItem("kwiigo_user");
        router.push("/");
      })
      .catch((error: any) => {
        console.error("Erreur lors de la déconnexion:", error);
        toast({
          title: "Erreur de déconnexion",
          description: "Impossible de vous déconnecter. Veuillez réessayer.",
          variant: "destructive",
        });
      });
  };

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="text-center animate-fadeIn">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-6"></div>
          <p className="text-xl font-semibold tracking-wide text-foreground">Connexion sécurisée en cours...</p>
          <p className="text-sm mt-2 opacity-80 text-muted-foreground">Veuillez patienter.</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "client") {
    return null; // Redirection gérée par useEffect
  }

  if (loadingOrders) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="text-center animate-fadeIn">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Shapes for visual interest - Simplifié pour une esthétique plus propre */}
      {/* Les formes sont maintenant des cercles simples avec des opacités réduites pour être subtiles */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/10 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Header */}
      <header className="bg-card shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Mon Tableau de Bord</h1>
          <div className="flex items-center space-x-4">
            <span className="text-base font-medium text-muted-foreground">Bonjour, <span className="font-semibold text-foreground">{user.name || "Client"}</span></span>
            <Button variant="ghost" size="sm" onClick={() => router.push("/client/track-order")} className="text-primary hover:text-primary-foreground hover:bg-primary transition-colors">
              <MapPin className="h-5 w-5 mr-2" />
              Suivi de ma commande
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/client/profile")} className="text-primary hover:text-primary-foreground hover:bg-primary transition-colors">
              <UserIcon className="h-5 w-5 mr-2" />
              Profil
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/client/settings")} className="text-primary hover:text-primary-foreground hover:bg-primary transition-colors">
              <Settings className="h-5 w-5 mr-2" />
              Paramètres
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout} className="group transition-all duration-300 ease-in-out">
              <LogOut className="h-4 w-4 mr-2 group-hover:rotate-6 transition-transform" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        {/* Error Display */}
        {error && (
          <div className="mb-8 p-6 bg-destructive/10 border border-destructive/30 rounded-xl shadow-lg animate-fadeIn">
            <p className="text-destructive font-semibold text-lg flex items-center"><XCircle className="h-6 w-6 mr-3"/> Erreur : {error}</p>
            <Button variant="outline" className="mt-4 bg-destructive/5 text-destructive border-destructive/20 hover:bg-destructive/10 transition-colors" onClick={loadOrders}>
              Réessayer
            </Button>
          </div>
        )}

        {/* AI Assistant Card - MIS EN AVANT */}
        <Card className="mb-10 bg-card border-border shadow-2xl animate-scaleIn rounded-3xl overflow-hidden p-0 relative">
            <div className="absolute inset-0 bg-primary/5 opacity-10"></div> {/* Texture subtile avec couleur primaire */}
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between relative z-10">
                <div className="flex items-center text-center md:text-left md:mr-8 mb-4 md:mb-0">
                    <Bot className="h-16 w-16 text-primary mr-6 animate-pulse-slow" />
                    <div>
                        <h3 className="text-3xl font-extrabold text-foreground mb-2 leading-tight">Votre Assistant IA Personnel</h3>
                        <p className="text-lg text-muted-foreground max-w-lg">
                            Optimisez vos livraisons, obtenez des réponses instantanées et des conseils personnalisés 24/7.
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => router.push("/client/ai-assistant")}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-full shadow-lg transform transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl group"
                >
                    <MessageCircle className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
                    Commencer à discuter
                </Button>
            </CardContent>
        </Card>


        {/* Statistiques clés */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 animate-slideInUp">
          <Card className="bg-card shadow-md hover:shadow-xl transition-shadow duration-300 rounded-xl">
            <CardContent className="p-6 flex items-center">
              <div className="bg-primary/10 p-3 rounded-full flex items-center justify-center">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Commandes</p>
                <p className="text-3xl font-bold text-foreground mt-1">{orders.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-md hover:shadow-xl transition-shadow duration-300 rounded-xl">
            <CardContent className="p-6 flex items-center">
              <div className="bg-muted p-3 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {orders.filter((o) => o.status === "pending").length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-md hover:shadow-xl transition-shadow duration-300 rounded-xl">
            <CardContent className="p-6 flex items-center">
              <div className="bg-primary/10 p-3 rounded-full flex items-center justify-center">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">En cours</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {orders.filter((o) => o.status === "accepted" || o.status === "in_progress").length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-md hover:shadow-xl transition-shadow duration-300 rounded-xl">
            <CardContent className="p-6 flex items-center">
              <div className="bg-green-100 p-3 rounded-full flex items-center justify-center"> {/* Vert conservé pour la sémantique "terminé" */}
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Terminées</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {orders.filter((o) => o.status === "completed").length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section principale d'actions */}
        <div className="mb-10 flex flex-col sm:flex-row gap-4 animate-slideInUp delay-300">
          <Button
            onClick={() => router.push("/client/new-order")}
            size="lg"
            className="flex-1 py-3 px-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg transform transition-transform hover:scale-105"
          >
            <Plus className="h-6 w-6 mr-3" />
            Nouvelle demande de livraison
          </Button>
          <Button
            onClick={() => router.push("/client/ai-assistant")}
            size="lg"
            variant="outline"
            className="flex-1 py-3 px-6 text-lg border-primary text-primary hover:bg-primary/5 hover:text-primary rounded-full shadow-lg transform transition-transform hover:scale-105 group"
          >
            <Bot className="h-6 w-6 mr-3 group-hover:rotate-6 transition-transform" />
            Parler à l'Assistant IA
          </Button>
        </div>

        {/* Liste des Commandes */}
        <Card className="bg-card shadow-xl rounded-xl animate-fadeInUp delay-500">
          <CardHeader className="bg-secondary/50 border-border border-b py-4 px-6 rounded-t-xl">
            <CardTitle className="text-2xl font-bold text-foreground">Vos Livraisons Récentes</CardTitle>
            <CardDescription className="text-muted-foreground">Suivez le statut de vos commandes en un coup d'œil.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-5 border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-card">
                    {/* Infos de base */}
                    <div className="col-span-2">
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        Commande #{order.id?.slice(-6)}
                      </h3>
                      <p className="text-muted-foreground text-lg flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-primary" />
                        <span className="font-medium">{order.from}</span> → <span className="font-medium">{order.to}</span>
                      </p>
                      <p className="text-muted-foreground mt-2">
                        <span className="font-medium">Description:</span> {order.description}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">Poids:</span> {order.weight} kg
                      </p>
                      <div className="flex space-x-2 mt-2">
                        {order.urgent && <Badge className="bg-destructive text-destructive-foreground flex items-center"><Zap className="h-3 w-3 mr-1"/> Urgent</Badge>}
                        {order.fragile && <Badge className="bg-secondary text-secondary-foreground flex items-center"><Box className="h-3 w-3 mr-1"/> Fragile</Badge>}
                        {order.driverName && (
                          <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                            Chauffeur: {order.driverName}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Prix et Statut */}
                    <div className="text-left md:text-right flex flex-col items-start md:items-end space-y-3">
                      <p className="text-2xl font-bold text-primary">{formatPrice(order.price)}</p>
                      {getStatusBadge(order.status)}
                      <p className="text-sm text-muted-foreground mt-1">{formatDate(order.createdAt)}</p>
                      <div className="flex space-x-2 mt-4">
                        {(order.status === "accepted" ||
                          order.status === "in_progress" ||
                          order.status === "completed") && (
                          <Button variant="outline" size="sm" onClick={() => router.push(`/client/order/${order.id}`)} className="text-primary hover:bg-primary/5 border-primary/20">
                            <Eye className="h-4 w-4 mr-2" />
                            Détails
                          </Button>
                        )}

                        {order.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCancelOrder(order.id!)}
                            disabled={cancellingOrder === order.id}
                            className="text-destructive hover:bg-destructive/5 hover:text-destructive transition-colors"
                          >
                            {cancellingOrder === order.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 flex flex-col items-center justify-center bg-muted rounded-lg border border-dashed border-border animate-fadeIn">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-75" />
                  <p className="text-xl font-semibold text-foreground mb-4">
                    Aucune commande trouvée.
                  </p>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Il semble que vous n'ayez pas encore effectué de demande de livraison.
                    Commencez dès maintenant !
                  </p>
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-3 px-8 rounded-full shadow-lg transform transition-transform hover:scale-105"
                    onClick={() => router.push("/client/new-order")}
                  >
                    <Plus className="h-5 w-5 mr-3" />
                    Créer votre première commande
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* AI Navigation flottante */}
      <AINavigation userRole="client" />
    </div>
  );
}
