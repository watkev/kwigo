"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, TrendingUp, AlertTriangle, Send, Bot, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  type?: "analytics" | "optimization" | "alerts" | "reports"
}

export default function AdminAssistant() {
  const [messages, setMessages] = useState<AdminMessage[]>([
    {
      id: "1",
      content:
        "Bonjour ! Je suis votre assistant IA d'administration. Je peux vous aider avec l'analyse des performances, l'optimisation des opérations, la gestion des alertes et la génération de rapports.",
      isUser: false,
      timestamp: new Date(),
      type: "analytics",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const quickActions = [
    { label: "Analyser performances", icon: BarChart, type: "analytics" },
    { label: "Optimiser routes", icon: TrendingUp, type: "optimization" },
    { label: "Vérifier alertes", icon: AlertTriangle, type: "alerts" },
    { label: "Générer rapport", icon: Activity, type: "reports" },
  ]

  const kpis = [
    { label: "Livraisons aujourd'hui", value: "127", change: "+12%", color: "text-green-600" },
    { label: "Taux de satisfaction", value: "94.2%", change: "+2.1%", color: "text-green-600" },
    { label: "Temps moyen livraison", value: "42min", change: "-8%", color: "text-green-600" },
    { label: "Coût par livraison", value: "18.50€", change: "-5%", color: "text-green-600" },
  ]

  const handleSendMessage = async (content: string, type?: string) => {
    if (!content.trim()) return

    const userMessage: AdminMessage = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    setTimeout(() => {
      let aiResponse = ""

      switch (type) {
        case "analytics":
          aiResponse =
            "📊 **Analyse des performances (dernières 24h):**\n\n• **Livraisons réussies:** 127/132 (96.2%)\n• **Retards:** 3 commandes (causes: trafic x2, client absent x1)\n• **Chauffeur le plus performant:** Jean D. (18 livraisons, 0 retard)\n• **Zone la plus active:** Paris Centre (34% du volume)\n• **Pic d'activité:** 14h-16h (42 livraisons)\n\n**Recommandations:**\n- Renforcer l'équipe sur Paris Centre\n- Prévoir plus de créneaux 14h-16h"
          break
        case "optimization":
          aiResponse =
            "🎯 **Optimisations suggérées:**\n\n• **Routes:** Regrouper 12 livraisons Créteil → économie 2h30\n• **Planification:** Décaler 8 livraisons de 15h à 11h → -15% trafic\n• **Ressources:** Affecter 2 chauffeurs supplémentaires zone Sud\n• **Coûts:** Négocier carburant en gros → économie 8%/mois\n\n**Impact estimé:**\n- Réduction temps: 18%\n- Économies: 1,200€/mois\n- Satisfaction client: +5%"
          break
        case "alerts":
          aiResponse =
            "🚨 **Alertes système (3 actives):**\n\n• **URGENT:** Chauffeur Marc R. - retard 45min (embouteillage A86)\n  → Action: Client notifié, nouveau créneau proposé\n\n• **ATTENTION:** Stock carburant faible - Dépôt Vincennes\n  → Action: Commande passée, livraison demain 8h\n\n• **INFO:** Météo défavorable prévue demain 14h-18h\n  → Action: Planifier livraisons fragiles le matin\n\n*Toutes les alertes sont sous contrôle*"
          break
        case "reports":
          aiResponse =
            "📈 **Rapport hebdomadaire généré:**\n\n• **Volume:** 847 livraisons (+15% vs semaine précédente)\n• **CA:** 15,246€ (+12%)\n• **Satisfaction:** 94.2% (objectif: 95%)\n• **Incidents:** 7 (-30%)\n\n**Top performers:**\n1. Jean D. - 98 livraisons, 4.9/5\n2. Marie L. - 87 livraisons, 4.8/5\n3. Paul M. - 82 livraisons, 4.7/5\n\n*Rapport complet envoyé par email*"
          break
        default:
          aiResponse = `Analyse de votre demande: "${content}"\n\n**Suggestions d'actions:**\n• Consulter le tableau de bord temps réel\n• Vérifier les KPIs de performance\n• Examiner les alertes système\n• Générer un rapport personnalisé\n\nUtilisez les actions rapides pour un accès direct aux fonctionnalités principales.`
      }

      const aiMessage: AdminMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        type: type as any,
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1800)
  }

  const getMessageTypeColor = (type?: string) => {
    switch (type) {
      case "analytics":
        return "bg-blue-100 text-blue-800"
      case "optimization":
        return "bg-green-100 text-green-800"
      case "alerts":
        return "bg-red-100 text-red-800"
      case "reports":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-600" />
            Assistant IA Administration
          </CardTitle>
          <CardDescription>Votre copilote intelligent pour optimiser les opérations logistiques</CardDescription>
        </CardHeader>
      </Card>

      {/* KPIs Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{kpi.label}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
                <div className={`text-sm font-medium ${kpi.color}`}>{kpi.change}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alertes et statut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertes système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-red-800">Retard livraison</p>
                  <p className="text-sm text-red-600">Marc R. - 45min de retard</p>
                </div>
                <Badge className="bg-red-100 text-red-800">Urgent</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium text-orange-800">Stock carburant</p>
                  <p className="text-sm text-orange-600">Dépôt Vincennes - Niveau bas</p>
                </div>
                <Badge className="bg-orange-100 text-orange-800">Attention</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Performance temps réel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Livraisons du jour</span>
                  <span>127/150</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Satisfaction client</span>
                  <span>94.2%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Efficacité routes</span>
                  <span>88%</span>
                </div>
                <Progress value={88} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
          <CardTitle className="text-lg">Assistant IA</CardTitle>
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
                    <span className="text-sm">Analyse en cours...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Que souhaitez-vous analyser ?"
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
