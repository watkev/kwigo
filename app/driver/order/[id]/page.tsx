"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MapPin, Package, User, Phone, Send, MessageCircle, Calculator, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getOrderById,
  updateOrderStatus,
  sendMessage,
  getChatMessages,
  markMessagesAsRead,
  type Order,
  type ChatMessage,
} from "@/lib/firestore"

interface AppUser {
  uid: string
  email: string | null
  name: string
  role: string
  phone: string
  city: string
}

export default function OrderDetailsPage() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const orderId = params.id as string

  useEffect(() => {
    const userData = localStorage.getItem("kwiigo_user")
    if (!userData) {
      router.push("/auth/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "driver") {
      router.push("/auth/login")
      return
    }

    setUser(parsedUser)
  }, [router])

  useEffect(() => {
    if (user && orderId) {
      loadOrderDetails()
    }
  }, [user, orderId])

  useEffect(() => {
    if (order && user && (order.status === "accepted" || order.status === "in_progress")) {
      // Écouter les messages en temps réel seulement si la commande est en cours
      console.log("Démarrage de l'écoute des messages pour:", orderId)

      const unsubscribe = getChatMessages(orderId, (newMessages) => {
        console.log("Messages reçus:", newMessages)
        setMessages(newMessages)
        // Marquer les messages du client comme lus
        if (newMessages.length > 0) {
          markMessagesAsRead(orderId, user.uid).catch(console.error)
        }
      })

      return () => {
        console.log("Arrêt de l'écoute des messages")
        if (unsubscribe) {
          unsubscribe()
        }
      }
    }
  }, [order, user, orderId])

  useEffect(() => {
    // Scroll vers le bas quand de nouveaux messages arrivent
    scrollToBottom()
  }, [messages])

  const loadOrderDetails = async () => {
    try {
      setLoading(true)
      console.log("=== CHARGEMENT DÉTAILS COMMANDE ===")
      console.log("Order ID:", orderId)
      console.log("User:", user)

      const orderData = await getOrderById(orderId)
      console.log("Données commande récupérées:", orderData)

      // Vérifier que cette commande appartient bien au chauffeur connecté
      if (orderData.driverId !== user?.uid) {
        console.error("Accès refusé - Driver ID mismatch:", {
          orderDriverId: orderData.driverId,
          userUid: user?.uid,
        })
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas accès à cette commande",
          variant: "destructive",
        })
        router.push("/driver/dashboard")
        return
      }

      setOrder(orderData)
      console.log("Commande chargée avec succès")
    } catch (error) {
      console.error("=== ERREUR CHARGEMENT COMMANDE ===")
      console.error("Erreur complète:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les détails de la commande: " + (error as Error).message,
        variant: "destructive",
      })
      router.push("/driver/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !order) {
      console.log("Conditions non remplies:", {
        hasMessage: !!newMessage.trim(),
        hasUser: !!user,
        hasOrder: !!order,
      })
      return
    }

    try {
      setSendingMessage(true)
      console.log("=== ENVOI MESSAGE CHAUFFEUR ===")
      console.log("Order ID:", orderId)
      console.log("User:", user)
      console.log("Message:", newMessage.trim())

      await sendMessage(orderId, user.uid, user.name, "driver", newMessage.trim())

      console.log("Message envoyé avec succès")
      setNewMessage("")

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé au client",
      })

      // Pas de rafraîchissement - les messages se mettront à jour automatiquement
    } catch (error) {
      console.error("=== ERREUR ENVOI MESSAGE ===")
      console.error("Erreur complète:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message: " + (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setSendingMessage(false)
    }
  }

  const handleCompleteOrder = async () => {
    if (!order) return

    try {
      console.log("=== FINALISATION COMMANDE ===")
      console.log("Order ID:", orderId)

      await updateOrderStatus(orderId, "completed")

      toast({
        title: "Commande terminée",
        description: "La commande a été marquée comme terminée et le chat a été fermé",
      })

      // Redirection après un court délai
      setTimeout(() => {
        router.push("/driver/dashboard")
      }, 1500)
    } catch (error) {
      console.error("Erreur lors de la finalisation:", error)
      toast({
        title: "Erreur",
        description: "Impossible de finaliser la commande",
        variant: "destructive",
      })
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const calculateCommission = (price: number) => {
    return Math.round(price * 0.15)
  }

  const calculateDriverEarnings = (price: number) => {
    return price - calculateCommission(price)
  }

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FCFA`
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>
  }

  if (!user || !order) {
    return null
  }

  const canChat = order.status === "accepted" || order.status === "in_progress"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button variant="ghost" onClick={() => router.push("/driver/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="ml-4 text-2xl font-bold text-gray-900 dark:text-white">Commande #{order.id?.slice(-6)}</h1>
            <div className="ml-4">
              {order.status === "completed" ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Terminé
                </Badge>
              ) : (
                <Badge variant="default">En cours</Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Détails de la commande */}
          <div className="space-y-6">
            {/* Informations générales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Détails de la livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">
                      {order.from} → {order.to}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Créée le {formatDate(order.createdAt)}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Description du colis</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Poids: {order.weight} kg</p>
                </div>

                <div className="flex space-x-2">
                  {order.urgent && <Badge variant="destructive">Urgent</Badge>}
                  {order.fragile && <Badge variant="secondary">Fragile</Badge>}
                </div>
              </CardContent>
            </Card>

            {/* Adresses */}
            <Card>
              <CardHeader>
                <CardTitle>Adresses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-600 mb-2">📍 Collecte</h4>
                  <p className="text-sm">{order.pickupAddress}</p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium text-blue-600 mb-2">📍 Livraison</h4>
                  <p className="text-sm">{order.deliveryAddress}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Destinataire: {order.recipientName} ({order.recipientPhone})
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Informations client */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informations client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium">{order.clientName}</p>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4 mr-1" />
                      {order.clientPhone}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calcul des gains */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Détail des gains
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Prix total de la livraison:</span>
                  <span className="font-medium">{formatPrice(order.price)}</span>
                </div>

                <div className="flex justify-between text-red-600">
                  <span>Commission société (15%):</span>
                  <span>-{formatPrice(calculateCommission(order.price))}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold text-green-600">
                  <span>Vos gains:</span>
                  <span>{formatPrice(calculateDriverEarnings(order.price))}</span>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Vous devrez remettre {formatPrice(calculateCommission(order.price))} à la société Kwiigo
                </p>
              </CardContent>
            </Card>

            {/* Bouton finaliser */}
            {order.status !== "completed" && (
              <Button onClick={handleCompleteOrder} className="w-full" size="lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                Marquer comme livré
              </Button>
            )}
          </div>

          {/* Chat */}
          <div className="lg:sticky lg:top-8">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  {canChat ? `Chat avec ${order.clientName}` : "Chat fermé"}
                </CardTitle>
                <CardDescription>
                  {canChat
                    ? "Communiquez avec le client pour coordonner la livraison"
                    : order.status === "completed"
                      ? "La commande est terminée, le chat a été fermé"
                      : "Chat non disponible"}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                {canChat ? (
                  <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.length > 0 ? (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderRole === "driver" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.senderRole === "driver"
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.senderRole === "driver" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {formatMessageTime(message.timestamp)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Aucun message pour le moment</p>
                            <p className="text-sm">Commencez la conversation avec le client</p>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Formulaire d'envoi */}
                    <div className="border-t p-4">
                      <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Tapez votre message..."
                          disabled={sendingMessage}
                          className="flex-1"
                        />
                        <Button type="submit" disabled={sendingMessage || !newMessage.trim()}>
                          {sendingMessage ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Chat fermé</p>
                      <p className="text-sm">
                        {order.status === "completed" ? "La commande est terminée" : "Chat non disponible"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
