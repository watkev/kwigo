"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Truck, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await sendPasswordResetEmail(auth, email)
      setSent(true)
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe",
      })
    } catch (error: any) {
      console.error("Erreur lors de l'envoi de l'email:", error)

      let errorMessage = "Une erreur est survenue"

      if (error.code === "auth/user-not-found") {
        errorMessage = "Aucun compte trouvé avec cette adresse email"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Adresse email invalide"
      }

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Truck className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Mot de passe oublié</CardTitle>
          <CardDescription>
            {sent
              ? "Un email de réinitialisation a été envoyé"
              : "Entrez votre email pour réinitialiser votre mot de passe"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Envoi..." : "Envoyer le lien de réinitialisation"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Un email a été envoyé à <strong>{email}</strong>
              </p>
              <Button onClick={() => setSent(false)} variant="outline" className="w-full">
                Renvoyer l'email
              </Button>
            </div>
          )}

          <div className="mt-4 text-center">
            <Link href="/auth/login" className="inline-flex items-center text-sm text-blue-600 hover:underline">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour à la connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
