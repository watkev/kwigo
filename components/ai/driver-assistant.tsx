"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Fuel, MessageCircle, Send, Bot } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  type?: "route" | "traffic" | "fuel" | "general"
}

export default function DriverAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Bonjour ! Je suis votre assistant IA. Je peux vous aider avec l'optimisation des routes, les conseils de conduite, et répondre à vos questions sur vos livraisons.",
      isUser: false,
      timestamp: new Date(),
      type: "general",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const quickActions = [
    { label: "Optimiser ma route", icon: MapPin, type: "route" },
    { label: "Trafic en temps réel", icon: Clock, type: "traffic" },
    { label: "Conseils carburant", icon: Fuel, type: "fuel" },
    { label: "Aide générale", icon: MessageCircle, type: "general" },
  ]

  const handleSendMessage = async (content: string, type?: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
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
        case "route":
          aiResponse =
            "🗺️ **Optimisation de route suggérée:**\n\n• Évitez l'A86 entre 7h-9h (embouteillages)\n• Prenez la sortie Porte de Vincennes pour gagner 12 minutes\n• Station-service recommandée: Total Access à 2km\n• Temps estimé: 45 minutes au lieu de 1h02"
          break
        case "traffic":
          aiResponse =
            "🚦 **Conditions de trafic actuelles:**\n\n• Votre itinéraire principal: Fluide ✅\n• Alternative recommandée: Boulevard périphérique (gain de 8 min)\n• Accident signalé sur A4 - contournement suggéré\n• Prochaine mise à jour dans 15 minutes"
          break
        case "fuel":
          aiResponse =
            "⛽ **Conseils carburant optimisés:**\n\n• Station la moins chère sur votre route: Leclerc Créteil (-0,08€/L)\n• Consommation prévue: 12,5L pour cette tournée\n• Économie possible: 3,2€ avec conduite éco\n• Prochain plein recommandé: après 2 livraisons"
          break
        default:
          aiResponse = `Je comprends votre demande: "${content}". Voici quelques suggestions:\n\n• Consultez votre planning de livraisons\n• Vérifiez les conditions météo\n• Contactez le support si nécessaire\n• Utilisez les raccourcis rapides ci-dessus`
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        type: type as any,
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const getMessageTypeColor = (type?: string) => {
    switch (type) {
      case "route":
        return "bg-blue-100 text-blue-800"
      case "traffic":
        return "bg-orange-100 text-orange-800"
      case "fuel":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-600" />
            Assistant IA Chauffeur
          </CardTitle>
          <CardDescription>Votre copilote intelligent pour optimiser vos livraisons</CardDescription>
        </CardHeader>
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
                    message.isUser ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
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
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">L'assistant réfléchit...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
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
