"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Package, Truck, TrendingUp, Settings, LogOut, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { getAllOrders, getAllUsers, type Order, type FirestoreUser } from "@/lib/firestore"

export default function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<FirestoreUser[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
      return
    }

    if (user && user.role !== "admin") {
      router.push("/auth/login")
      return
    }

    if (user) {
      loadData()
    }
  }, [user, authLoading, router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [ordersData, usersData] = await Promise.all([getAllOrders(), getAllUsers()])

      setOrders(ordersData)
      setUsers(usersData)
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalUsers: users.length,
    totalClients: users.filter((u) => u.role === "client").length,
    totalDrivers: users.filter((u) => u.role === "driver").length,
    totalAdmins: users.filter((u) => u.role === "admin").length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    inProgressOrders: orders.filter((o) => o.status === "accepted" || o.status === "in_progress").length,
    completedOrders: orders.filter((o) => o.status === "completed").length,
    totalRevenue: orders.filter((o) => o.status === "completed").reduce((sum, order) => sum + order.price, 0),
  }

  const recentActivities = orders.slice(0, 10).map((order) => ({
    id: order.id,
    type:
      order.status === "pending"
        ? "order_created"
        : order.status === "accepted"
          ? "order_accepted"
          : order.status === "completed"
            ? "order_completed"
            : "order_updated",
    user: order.status === "accepted" || order.status === "completed" ? order.driverName : order.clientName,
    action:
      order.status === "pending"
        ? "a créé une nouvelle commande"
        : order.status === "accepted"
          ? "a accepté la commande"
          : order.status === "completed"
            ? "a terminé la commande"
            : "a mis à jour la commande",
    orderId: order.id?.slice(-6),
    timestamp: formatDate(order.updatedAt),
  }))

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "order_created":
        return <Package className="h-4 w-4 text-blue-600" />
      case "order_accepted":
        return <Truck className="h-4 w-4 text-green-600" />
      case "order_completed":
        return <Package className="h-4 w-4 text-green-600" />
      case "user_registered":
        return <Users className="h-4 w-4 text-purple-600" />
      default:
        return <Eye className="h-4 w-4 text-gray-600" />
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Récemment"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `Il y a ${hours} heure${hours > 1 ? "s" : ""}`
    } else {
      const days = Math.floor(diffInMinutes / 1440)
      return `Il y a ${days} jour${days > 1 ? "s" : ""}`
    }
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tableau de bord Administrateur</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">Bonjour, {user.name}</span>
              <Button variant="outline" size="sm" onClick={() => router.push("/admin/users")}>
                <Users className="h-4 w-4 mr-2" />
                Utilisateurs
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push("/admin/settings")}>
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Utilisateurs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Commandes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Chauffeurs Actifs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDrivers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalRevenue.toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Répartition des Utilisateurs</CardTitle>
              <CardDescription>Distribution par type d'utilisateur</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Clients</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: stats.totalUsers > 0 ? `${(stats.totalClients / stats.totalUsers) * 100}%` : "0%",
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{stats.totalClients}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Chauffeurs</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: stats.totalUsers > 0 ? `${(stats.totalDrivers / stats.totalUsers) * 100}%` : "0%",
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{stats.totalDrivers}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Administrateurs</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{
                          width: stats.totalUsers > 0 ? `${(stats.totalAdmins / stats.totalUsers) * 100}%` : "0%",
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{stats.totalAdmins}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>État des Commandes</CardTitle>
              <CardDescription>Statut actuel des commandes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">En attente</span>
                  <Badge variant="secondary">{stats.pendingOrders}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">En cours</span>
                  <Badge variant="default">{stats.inProgressOrders}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Terminées</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {stats.completedOrders}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Activités Récentes</CardTitle>
            <CardDescription>Dernières actions effectuées par les utilisateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                        {activity.orderId && <span className="font-medium text-blue-600"> #{activity.orderId}</span>}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{activity.timestamp}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Aucune activité récente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
