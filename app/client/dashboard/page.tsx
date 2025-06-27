"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Settings,
  LogOut,
  Trash2,
  Eye,
  Bot,
  MessageCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getOrdersByClient, updateOrderStatus, type Order } from "@/lib/firestore"
import AINavigation from "@/components/ai/ai-navigation"

interface AppUser {
  uid: string
  email: string | null
  name: string
  role: string
  phone: string
  city: string
}

export default function ClientDashboard() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const userData = localStorage.getItem("kwiigo_user")
    if (!userData) {
      router.push("/auth/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "client") {
      router.push("/auth/login")
      return
    }

    setUser(parsedUser)
  }, [router])

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  const loadOrders = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      console.log("Chargement des commandes pour l'utilisateur:", user)

      const userOrders = await getOrdersByClient(user.uid)
      console.log("Commandes chargées:", userOrders)

      setOrders(userOrders)
    } catch (error: any) {
      console.error("Erreur lors du chargement des commandes:", error)

      const errorMessage = error.message || "Impossible de charger vos commandes"
      setError(errorMessage)

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!orderId) return

    try {
      setCancellingOrder(orderId)

      await updateOrderStatus(orderId, "cancelled")

      // Recharger les commandes
      await loadOrders()

      toast({
        title: "Commande annulée",
        description: `La commande ${orderId.slice(-6)} a été annulée avec succès`,
      })
    } catch (error: any) {
      console.error("Erreur lors de l'annulation:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la commande",
        variant: "destructive",
      })
    } finally {
      setCancellingOrder(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        )
      case "accepted":
      case "in_progress":
        return (
          <Badge variant="default">
            <Package className="h-3 w-3 mr-1" />
            En cours
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Terminé
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Annulé
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ""
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString("fr-FR")
    } catch (error) {
      console.error("Erreur de formatage de date:", error)
      return ""
    }
  }

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FCFA`
  }

  const handleLogout = () => {
    localStorage.removeItem("kwiigo_user")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement de vos commandes...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord Client</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">Bonjour, {user.name}</span>
              <Button variant="outline" size="sm" onClick={() => router.push("/client/profile")}>
                <User className="h-4 w-4 mr-2" />
                Profil
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/client/settings")}>
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">Erreur: {error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={loadOrders}>
              Réessayer
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Commandes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En attente</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {orders.filter((o) => o.status === "pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En cours</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {orders.filter((o) => o.status === "accepted" || o.status === "in_progress").length}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Terminées</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {orders.filter((o) => o.status === "completed").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bot className="h-10 w-10 text-blue-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assistant IA Personnel</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Suivez vos commandes, obtenez des estimations et posez vos questions
                  </p>
                </div>
              </div>
              <Button onClick={() => router.push("/client/ai-assistant")} className="bg-blue-600 hover:bg-blue-700">
                <MessageCircle className="h-4 w-4 mr-2" />
                Ouvrir l'assistant
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mb-8 flex gap-4">
          <Button onClick={() => router.push("/client/new-order")} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle demande de livraison
          </Button>
          <Button
            onClick={() => router.push("/client/ai-assistant")}
            size="lg"
            variant="outline"
            className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100"
          >
            <Bot className="h-5 w-5 mr-2" />
            Assistant IA
          </Button>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Mes Commandes</CardTitle>
            <CardDescription>Historique de toutes vos demandes de livraison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">#{order.id?.slice(-6)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.from} → {order.to}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">{order.description}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Poids: {order.weight} kg</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">{formatPrice(order.price)}</p>
                        {order.driverName && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">Chauffeur: {order.driverName}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Bouton voir détails pour les commandes acceptées */}
                        {(order.status === "accepted" ||
                          order.status === "in_progress" ||
                          order.status === "completed") && (
                          <Button variant="outline" size="sm" onClick={() => router.push(`/client/order/${order.id}`)}>
                            <Eye className="h-3 w-3 mr-1" />
                            Détails
                          </Button>
                        )}

                        {getStatusBadge(order.status)}

                        {/* Bouton d'annulation pour les commandes en attente */}
                        {order.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelOrder(order.id!)}
                            disabled={cancellingOrder === order.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {cancellingOrder === order.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Vous n'avez pas encore de commandes</p>
                  <Button className="mt-4" onClick={() => router.push("/client/new-order")}>
                    <Plus className="h-4 w-4 mr-2" />
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
  )
}
