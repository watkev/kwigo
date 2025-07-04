"use client"

import { useState, useEffect } from "react"

// Version simplifiée sans Firebase
export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Simuler un utilisateur connecté pour les tests
    setUser({
      uid: "test-user-123",
      email: "kevin.watong@example.com",
      displayName: "Kevin Watong",
    })
    setIsLoading(false)
  }, [])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  }
}
