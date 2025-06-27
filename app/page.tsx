"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Package, Users, MapPin } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("kwiigo_user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      // Redirect based on user role
      switch (parsedUser.role) {
        case "client":
          router.push("/client/dashboard")
          break
        case "driver":
          router.push("/driver/dashboard")
          break
        case "admin":
          router.push("/admin/dashboard")
          break
      }
    }
  }, [router])

  if (user) {
    return <div className="flex items-center justify-center min-h-screen">Redirection...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">Kwiigo</span>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => router.push("/auth/login")}>
                Connexion
              </Button>
              <Button onClick={() => router.push("/auth/register")}>S'inscrire</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            Transport et Logistique
            <span className="block text-blue-600">au Cameroun</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Connectez-vous avec des chauffeurs professionnels pour vos livraisons entre Bafoussam, Yaoundé et Douala.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Button size="lg" onClick={() => router.push("/auth/register")}>
              Commencer maintenant
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Package className="h-8 w-8 text-blue-600" />
                <CardTitle>Livraisons Rapides</CardTitle>
                <CardDescription>
                  Expédiez vos colis rapidement entre les principales villes du Cameroun
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-blue-600" />
                <CardTitle>Chauffeurs Vérifiés</CardTitle>
                <CardDescription>
                  Tous nos chauffeurs sont vérifiés et expérimentés pour garantir la sécurité
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <MapPin className="h-8 w-8 text-blue-600" />
                <CardTitle>Couverture Nationale</CardTitle>
                <CardDescription>Service disponible à Bafoussam, Yaoundé, Douala et leurs environs</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Cities */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Nos Villes de Service</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Bafoussam</h3>
                <p className="text-gray-600 dark:text-gray-300">Région de l'Ouest</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Yaoundé</h3>
                <p className="text-gray-600 dark:text-gray-300">Capitale politique</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">Douala</h3>
                <p className="text-gray-600 dark:text-gray-300">Capitale économique</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
