"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Package, Clock, Calculator, MessageCircle, Send, Bot, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ClientMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  type?: "tracking" | "estimate" | "pricing" | "support"
}

export default function ClientAssistant() {
  const [messages, setMessages] = useState<ClientMessage[]>([
    {
      id: "1",
      content:
        "Bonjour ! Je suis votre assistant logistique. Je peux vous aider avec le suivi de vos colis, les estimations de livraison, les tarifs, et répondre à toutes vos questions.",
      isUser: false,
      timestamp: new Date(),
      type: "support",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const quickActions = [
    { label: "Suivre ma commande", icon: Package, type: "tracking" },
    { label: "Estimer livraison", icon: Clock, type: "estimate" },
    { label: "Calculer tarif", icon: Calculator, type: "pricing" },
    { label: "Support client", icon: MessageCircle, type: "support" },
  ]

  const handleSendMessage = async (content: string, type?: string) => {
    if (!content.trim()) return

    const userMessage: ClientMessage = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simuler une réponse IA basée sur le type de demande
    setTimeout(() => {
      let aiResponse = ""

      switch (type) {
        case "tracking":
          aiResponse =
            "📦 **Suivi de votre commande #2llOb:**\n\n• **Statut:** En attente de chauffeur 🕐\n• **Trajet:** Douala → Bafoussam\n• **Poids:** 2 kg\n• **Prix:** 12,500 FCFA\n• **Date de création:** 26/06/2025\n• **Estimation:** Attribution d'un chauffeur dans les 2h\n\n*Vous recevrez une notification dès qu'un chauffeur acceptera votre commande*"
          break
        case "estimate":
          aiResponse =
            "⏰ **Estimation de livraison:**\n\n• **Origine:** Paris 15ème\n• **Destination:** Créteil\n• **Distance:** 28 km\n• **Temps de trajet:** 45-60 minutes\n• **Créneaux disponibles:**\n  - Aujourd'hui: 16h00-18h00\n  - Demain: 09h00-12h00, 14h00-17h00\n• **Livraison express (+2h):** +15€"
          break
        case "pricing":
          aiResponse =
            "💰 **Estimation tarifaire:**\n\n• **Distance:** 28 km\n• **Poids estimé:** 15 kg\n• **Volume:** 0.5 m³\n• **Tarif de base:** 25€\n• **Supplément weekend:** +5€\n• **Assurance (optionnelle):** +3€\n\n**Total estimé:** 30-33€ TTC\n\n*Tarif définitif après validation des dimensions exactes*"
          break
        default:
          aiResponse = `Je comprends votre demande: "${content}". Voici comment je peux vous aider:\n\n• **Suivi en temps réel** de vos colis\n• **Estimations précises** de livraison\n• **Calculs de tarifs** personnalisés\n• **Support client** 24h/7j\n\nUtilisez les boutons rapides ci-dessus pour un service plus rapide !`
      }

      const aiMessage: ClientMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        type: type as any,
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1200)
  }

  const getMessageTypeColor = (type?: string) => {
    switch (type) {
      case "tracking":
        return "bg-blue-100 text-blue-800"
      case "estimate":
        return "bg-purple-100 text-purple-800"
      case "pricing":
        return "bg-green-100 text-green-800"
      case "support":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-purple-600" />
            Assistant IA Client
          </CardTitle>
          <CardDescription>Votre assistant personnel pour toutes vos questions logistiques</CardDescription>
        </CardHeader>
      </Card>

      {/* Statut rapide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vos commandes actives</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">#2llOb</span>
                <Badge className="bg-orange-100 text-orange-800">En attente</Badge>
              </div>
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  douala → bafoussam (2 kg)
                </div>
                <div className="text-xs text-gray-500 mt-1">12500 FCFA</div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">#TleyeS</span>
                <Badge className="bg-green-100 text-green-800">Terminé</Badge>
              </div>
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  bafoussam → douala (2 kg)
                </div>
                <div className="text-xs text-gray-500 mt-1">12500 FCFA</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.type}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => handleSendMessage(action.label, action.type)}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-xs text-center">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {!message.isUser && message.type && (
                    <Badge className={`mb-2 ${getMessageTypeColor(message.type)}`}>{message.type}</Badge>
                  )}
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  <div className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    <span className="text-sm">L'assistant analyse...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Comment puis-je vous aider ?"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage(input)}
              disabled={isLoading}
            />
            <Button onClick={() => handleSendMessage(input)} disabled={isLoading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
