"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, MapPin, Clock, User, Settings, LogOut, CheckCircle, Eye, Calculator } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { getAvailableOrders, getOrdersByDriver, updateOrderStatus, type Order } from "@/lib/firestore"

export default function DriverDashboard() {
  const { user, loading: authLoading, logout } = useAuth()
  const [availableOrders, setAvailableOrders] = useState<Order[]>([])
  const [myOrders, setMyOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
      return
    }

    if (user && user.role !== "driver") {
      router.push("/auth/login")
      return
    }

    if (user) {
      loadData()
    }
  }, [user, authLoading, router])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)
      console.log("=== DÉBUT CHARGEMENT DONNÉES CHAUFFEUR ===")
      console.log("Utilisateur connecté:", user)

      // Charger les commandes disponibles
      console.log("Chargement des commandes disponibles...")
      const available = await getAvailableOrders()
      console.log("Commandes disponibles récupérées:", available)
      console.log("Nombre de commandes disponibles:", available.length)

      // Charger mes commandes
      console.log("Chargement des commandes du chauffeur...")
      const myOrdersData = await getOrdersByDriver(user.uid)
      console.log("Mes commandes récupérées:", myOrdersData)
      console.log("Nombre de mes commandes:", myOrdersData.length)

      setAvailableOrders(available)
      setMyOrders(myOrdersData)

      console.log("=== FIN CHARGEMENT DONNÉES CHAUFFEUR ===")
    } catch (error: any) {
      console.error("=== ERREUR CHARGEMENT DONNÉES ===")
      console.error("Type d'erreur:", typeof error)
      console.error("Message d'erreur:", error.message)
      console.error("Code d'erreur:", error.code)
      console.error("Stack trace:", error.stack)
      console.error("Erreur complète:", error)

      toast({
        title: "Erreur",
        description: `Impossible de charger les commandes: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptOrder = async (orderId: string) => {
    if (!user) return

    try {
      await updateOrderStatus(orderId, "accepted", user.uid, user.name)

      // Recharger les données
      await loadData()

      toast({
        title: "Commande acceptée",
        description: `Vous avez accepté la commande ${orderId.slice(-6)}`,
      })
    } catch (error) {
      console.error("Erreur lors de l'acceptation:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'accepter la commande",
        variant: "destructive",
      })
    }
  }

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, "completed")

      // Recharger les données
      await loadData()

      toast({
        title: "Commande terminée",
        description: `La commande ${orderId.slice(-6)} a été marquée comme terminée`,
      })
    } catch (error) {
      console.error("Erreur lors de la finalisation:", error)
      toast({
        title: "Erreur",
        description: "Impossible de finaliser la commande",
        variant: "destructive",
      })
    }
  }

  const calculateCommission = (price: number) => {
    return Math.round(price * 0.15) // 15% de commission
  }

  const calculateDriverEarnings = (price: number) => {
    return price - calculateCommission(price) // 85% pour le chauffeur
  }

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FCFA`
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("fr-FR")
  }

  if (authLoading || loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord Chauffeur</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">Bonjour, {user.name}</span>
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
                availableOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">#{order.id?.slice(-6)}</h3>
                        <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {order.from} → {order.to}
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
                        <div className="flex space-x-2 mt-2">
                          {order.urgent && <Badge variant="destructive">Urgent</Badge>}
                          {order.fragile && <Badge variant="secondary">Fragile</Badge>}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Description:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{order.description}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Poids: {order.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Client:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{order.clientName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{order.clientPhone}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Collecte:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{order.pickupAddress}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Livraison:</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{order.deliveryAddress}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Destinataire: {order.recipientName} ({order.recipientPhone})
                        </p>
                      </div>
                    </div>

                    <Button onClick={() => handleAcceptOrder(order.id!)} className="w-full">
                      Accepter cette commande
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Aucune commande disponible pour le moment</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Mes commandes</CardTitle>
            <CardDescription>Commandes que vous avez acceptées</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myOrders.length > 0 ? (
                myOrders.map((order) => (
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
                          <p className="text-sm text-gray-600 dark:text-gray-400">Client: {order.clientName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">{formatPrice(order.price)}</p>
                        <div className="text-xs space-y-1">
                          <p className="text-blue-600">
                            Vos gains: {formatPrice(calculateDriverEarnings(order.price))}
                          </p>
                          <p className="text-red-600">Commission: {formatPrice(calculateCommission(order.price))}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {/* Bouton voir détails pour les commandes acceptées */}
                        {(order.status === "accepted" || order.status === "in_progress") && (
                          <Button variant="outline" size="sm" onClick={() => router.push(`/driver/order/${order.id}`)}>
                            <Eye className="h-3 w-3 mr-1" />
                            Détails
                          </Button>
                        )}

                        {order.status === "completed" ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Terminé
                          </Badge>
                        ) : (
                          <Button size="sm" onClick={() => handleCompleteOrder(order.id!)}>
                            Marquer comme terminé
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Vous n'avez pas encore accepté de commandes</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
