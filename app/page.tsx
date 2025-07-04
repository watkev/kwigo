"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Package, Shield, MapPin, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm tracking-wide">Redirection en cours...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header élégant */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            {/* Logo KwiiGo professionnel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center"
            >
              <div className="relative">
                <div className="text-2xl font-semibold text-blue-600 tracking-wide">KwiiGo</div>
                <div className="absolute -bottom-1 left-0 w-full h-px bg-blue-600"></div>
              </div>
            </motion.div>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex space-x-4"
            >
              <Button
                variant="ghost"
                onClick={() => router.push("/auth/login")}
                className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-6 py-2 font-medium"
              >
                Connexion
              </Button>
              <Button
                onClick={() => router.push("/auth/register")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-medium shadow-sm"
              >
                S'inscrire
              </Button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section principale */}
        <section className="py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-8">
                Transport et Logistique
                <span className="block text-blue-600 mt-2">au Cameroun</span>
              </h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="mb-12"
              >
                <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                  Connectez-vous avec des chauffeurs professionnels pour vos livraisons entre Bafoussam, Yaoundé et
                  Douala.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Button
                  size="lg"
                  onClick={() => router.push("/auth/register")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-base font-semibold tracking-wide shadow-lg group"
                >
                  Commencer maintenant
                  <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Section Services */}
        <section className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Services</h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                icon: Package,
                title: "Livraisons Express",
                description: "Expédition rapide et sécurisée de vos colis entre les principales villes du Cameroun.",
                color: "bg-blue-500",
              },
              {
                icon: Shield,
                title: "Chauffeurs Certifiés",
                description: "Professionnels vérifiés et expérimentés pour garantir la sécurité de vos envois.",
                color: "bg-green-500",
              },
              {
                icon: MapPin,
                title: "Couverture Étendue",
                description: "Service disponible dans les principales villes et leurs zones périphériques.",
                color: "bg-orange-500",
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 text-center p-6">
                  <CardContent className="p-0">
                    <div
                      className={`w-16 h-16 mx-auto mb-6 ${service.color} rounded-full flex items-center justify-center shadow-md`}
                    >
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{service.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{service.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section Villes */}
        <section className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Zones de Service</h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Bafoussam", region: "Région de l'Ouest", status: "Actif" },
              { name: "Yaoundé", region: "Capitale politique", status: "Actif" },
              { name: "Douala", region: "Capitale économique", status: "Actif" },
            ].map((city, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div className="flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-sm font-semibold text-green-600 uppercase tracking-wide bg-green-50 px-3 py-1 rounded-full">
                        {city.status}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{city.name}</h3>
                    <p className="text-gray-600">{city.region}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section Statistiques */}
        <section className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">KwiiGo en chiffres</h2>
            <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { number: "1000+", label: "Livraisons réussies", color: "bg-blue-500" },
              { number: "50+", label: "Chauffeurs actifs", color: "bg-green-500" },
              { number: "3", label: "Villes couvertes", color: "bg-orange-500" },
              { number: "24/7", label: "Support client", color: "bg-purple-500" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-12 h-12 mx-auto mb-4 ${stat.color} rounded-full flex items-center justify-center`}
                    >
                      <span className="text-white font-bold text-lg">{index + 1}</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                    <p className="text-gray-600 font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section CTA finale */}
        <section className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-blue-600 rounded-2xl p-12 text-center text-white"
          >
            <h2 className="text-3xl font-bold mb-6">Prêt à commencer ?</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers d'utilisateurs qui font confiance à KwiiGo pour leurs besoins de transport et de
              logistique.
            </p>
            <Button
              size="lg"
              onClick={() => router.push("/auth/register")}
              className="bg-white hover:bg-gray-100 text-blue-600 px-12 py-4 text-base font-semibold shadow-lg"
            >
              Créer un compte gratuitement
            </Button>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-semibold text-blue-600 tracking-wide mb-4">KwiiGo</div>
            <p className="text-gray-600">© 2024 KwiiGo. Transport et logistique au Cameroun.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
