"use client"

import type React from "react"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  // Version simplifiée sans authentification Firebase
  // Vous pouvez ajouter votre logique d'authentification ici plus tard

  return <div className="min-h-screen">{children}</div>
}
