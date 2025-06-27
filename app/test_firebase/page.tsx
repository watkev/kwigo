"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { auth, db } from "@/lib/firebase"
import { collection, addDoc, getDocs, Timestamp } from "firebase/firestore"

export default function TestFirebasePage() {
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    setResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testFirebaseConnection = async () => {
    setLoading(true)
    setResults([])

    try {
      addResult("🔍 Test de connexion Firebase...")

      // Test 1: Vérifier l'authentification
      addResult(`✅ Auth initialisé: ${!!auth}`)
      addResult(`👤 Utilisateur connecté: ${auth.currentUser?.email || "Non connecté"}`)

      // Test 2: Vérifier Firestore
      addResult(`✅ Firestore initialisé: ${!!db}`)

      // Test 3: Essayer de lire une collection
      addResult("📖 Test de lecture des commandes...")
      const ordersSnapshot = await getDocs(collection(db, "orders"))
      addResult(`✅ Commandes trouvées: ${ordersSnapshot.size}`)

      // Test 4: Essayer de créer un message de test
      addResult("💬 Test de création d'un message...")
      const testMessage = {
        orderId: "test-order-id",
        senderId: auth.currentUser?.uid || "test-user",
        senderName: "Test User",
        senderRole: "driver" as const,
        message: "Message de test",
        timestamp: Timestamp.now(),
        read: false,
      }

      const docRef = await addDoc(collection(db, "chat_messages"), testMessage)
      addResult(`✅ Message de test créé avec l'ID: ${docRef.id}`)

      // Test 5: Lire les messages
      addResult("📖 Test de lecture des messages...")
      const messagesSnapshot = await getDocs(collection(db, "chat_messages"))
      addResult(`✅ Messages trouvés: ${messagesSnapshot.size}`)

      addResult("🎉 Tous les tests Firebase réussis!")
    } catch (error: any) {
      addResult(`❌ Erreur: ${error.message}`)
      addResult(`🔍 Code d'erreur: ${error.code}`)
      console.error("Erreur test Firebase:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test de connexion Firebase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testFirebaseConnection} disabled={loading}>
              {loading ? "Test en cours..." : "Lancer le test Firebase"}
            </Button>

            {results.length > 0 && (
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Résultats du test:</h3>
                <div className="space-y-1 text-sm font-mono">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={
                        result.includes("❌")
                          ? "text-red-600"
                          : result.includes("✅")
                            ? "text-green-600"
                            : result.includes("🎉")
                              ? "text-blue-600"
                              : "text-gray-700 dark:text-gray-300"
                      }
                    >
                      {result}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
