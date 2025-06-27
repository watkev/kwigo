"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Truck, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Connexion avec Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Récupérer les informations utilisateur depuis Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid))

      if (userDoc.exists()) {
        const userData = userDoc.data()

        // Stocker les informations utilisateur localement
        const userInfo = {
          uid: user.uid,
          email: user.email,
          name: userData.name,
          role: userData.role,
          phone: userData.phone,
          city: userData.city,
        }

        localStorage.setItem("kwiigo_user", JSON.stringify(userInfo))

        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur Kwiigo!",
        })

        // Redirection basée sur le rôle
        switch (userData.role) {
          case "client":
            router.push("/client/dashboard")
            break
          case "driver":
            router.push("/driver/dashboard")
            break
          case "admin":
            router.push("/admin/dashboard")
            break
          default:
            router.push("/")
        }
      } else {
        throw new Error("Données utilisateur introuvables")
      }
    } catch (error: any) {
      console.error("Erreur lors de la connexion:", error)

      let errorMessage = "Email ou mot de passe incorrect"

      if (error.code === "auth/user-not-found") {
        errorMessage = "Aucun compte trouvé avec cette adresse email"
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Mot de passe incorrect"
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Adresse email invalide"
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Trop de tentatives. Veuillez réessayer plus tard"
      }

      toast({
        title: "Erreur de connexion",
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
          <CardTitle className="text-2xl font-bold">Kwiigo</CardTitle>
          <CardDescription>Connectez-vous à votre compte</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>

          <div className="mt-4 text-center space-y-2">
            <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
              Mot de passe oublié ?
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pas de compte ?{" "}
              <Link href="/auth/register" className="text-blue-600 hover:underline">
                S'inscrire
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">Comptes de test :</p>
            <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <p>Client: client@kwiigo.com</p>
              <p>Chauffeur: driver@kwiigo.com</p>
              <p>Admin: admin@kwiigo.com</p>
              <p>Mot de passe: 123456</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
