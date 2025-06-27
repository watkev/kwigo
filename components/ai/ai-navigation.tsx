"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bot, MessageCircle, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface AINavigationProps {
  userRole: "admin" | "client" | "driver"
}

export default function AINavigation({ userRole }: AINavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const getAILink = () => {
    switch (userRole) {
      case "admin":
        return "/admin/ai-assistant"
      case "client":
        return "/client/ai-assistant"
      case "driver":
        return "/driver/ai-assistant"
      default:
        return "#"
    }
  }

  const getAITitle = () => {
    switch (userRole) {
      case "admin":
        return "Assistant IA Admin"
      case "client":
        return "Assistant IA Client"
      case "driver":
        return "Assistant IA Chauffeur"
      default:
        return "Assistant IA"
    }
  }

  const getAIDescription = () => {
    switch (userRole) {
      case "admin":
        return "Optimisez vos opérations avec l'IA"
      case "client":
        return "Suivez vos commandes intelligemment"
      case "driver":
        return "Optimisez vos tournées avec l'IA"
      default:
        return "Votre assistant intelligent"
    }
  }

  // Ne pas afficher sur la page de l'assistant IA
  if (pathname?.includes("ai-assistant")) {
    return null
  }

  // Floating AI button
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 animate-pulse"
          size="icon"
        >
          <Bot className="h-6 w-6" />
        </Button>
      </div>
    )
  }

  // Expanded AI card
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 shadow-xl border-2 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              <span className="font-medium">{getAITitle()}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-gray-600 mb-4">{getAIDescription()}</p>

          <div className="flex gap-2">
            <Link href={getAILink()} className="flex-1">
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="sm"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Ouvrir l'assistant
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Plus tard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
