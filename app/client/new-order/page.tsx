"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Package, Calculator, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createOrder } from "@/lib/firestore"
import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"
import { Switch } from "@/components/ui/switch"

// Dynamically import Leaflet map to prevent SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

interface User {
  uid: string
  email: string | null
  name: string
  role: string
  phone: string
  city: string
}

interface FormData {
  from: string // <-- ici, string au lieu de number
  to: string
  description: string
  pickupAddress: string
  deliveryAddress: string
  weight: string
  fragile: boolean
  urgent: boolean
  recipientName: string
  recipientPhone: string
}

interface FormErrors {
  from?: string
  to?: string
  pickupAddress?: string
  deliveryAddress?: string
  description?: string
  weight?: string
  recipientName?: string
  recipientPhone?: string
}

export default function NewOrderPage() {
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<FormData>({
    from: "", // <-- string vide
    to: "",
    description: "",
    weight: "",
    fragile: false,
    urgent: false,
    recipientName: "",
    recipientPhone: "",
    pickupAddress: "",
    deliveryAddress: "",
  })
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [driverLocation, setDriverLocation] = useState<[number, number]>([3.848, 11.502]) // Default: Yaoundé
  const router = useRouter()
  const { toast } = useToast()

  // Simulate driver location updates (replace with real WebSocket/polling in production)
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverLocation((prev) => [
        prev[0] + (Math.random() - 0.5) * 0.01,
        prev[1] + (Math.random() - 0.5) * 0.01,
      ])
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Check user authentication
  useEffect(() => {
    const userData = localStorage.getItem("kwiigo_user")
    if (!userData) {
      router.push("/auth/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "client") {
      router.push("/auth/login")
      return
    }

    setUser(parsedUser)
  }, [router])

  // Validate form fields
  const validateForm = useCallback((): FormErrors => {
    const errors: FormErrors = {}
    if (!formData.from) errors.from = "Ville de départ requise"
    if (!formData.to) errors.to = "Ville de destination requise"
    if (!formData.pickupAddress) errors.pickupAddress = "Adresse de collecte requise"
    if (!formData.deliveryAddress) errors.deliveryAddress = "Adresse de livraison requise"
    if (!formData.description) errors.description = "Description requise"
    if (!formData.weight || Number.parseFloat(formData.weight) <= 0) errors.weight = "Poids valide requis"
    if (!formData.recipientName) errors.recipientName = "Nom du destinataire requis"
    if (!formData.recipientPhone.match(/^\+237\s?6\d{2}\s?\d{3}\s?\d{3}$/)) {
      errors.recipientPhone = "Numéro de téléphone valide requis (+237 6XX XXX XXX)"
    }
    return errors
  }, [formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validateForm()
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      toast({
        title: "Erreur",
        description: "Veuillez corriger les erreurs dans le formulaire",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      if (!user) throw new Error("Utilisateur non connecté")

      const orderData = {
        clientId: user.uid,
        clientName: user.name,
        clientPhone: user.phone,
        from: formData.from,
        to: formData.to,
        pickupAddress: formData.pickupAddress,
        deliveryAddress: formData.deliveryAddress,
        description: formData.description,
        weight: formData.weight,
        fragile: formData.fragile,
        urgent: formData.urgent,
        recipientName: formData.recipientName,
        recipientPhone: formData.recipientPhone,
        status: "pending" as const,
        price: calculatePrice(),
      }

      await createOrder(orderData)
      toast({
        title: "Commande créée",
        description: "Votre demande de livraison a été enregistrée avec succès",
      })
      router.push("/client/dashboard")
    } catch (error) {
      console.error("Erreur lors de la création de la commande:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la commande",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setFormErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const calculatePrice = (): number => {
    const weight = Number.parseFloat(formData.weight) || 0
    let basePrice = weight * 500
    if (basePrice < 1000) basePrice = 1000

    const distanceFees: Record<string, number> = {
      "yaounde-douala": 5000,
      "douala-yaounde": 5000,
      "yaounde-bafoussam": 3000,
      "bafoussam-yaounde": 3000,
      "douala-bafoussam": 7000,
      "bafoussam-douala": 7000,
    }

    const route = `${formData.from}-${formData.to}`
    const distanceFee = distanceFees[route] || 2000
    let totalPrice = basePrice + distanceFee

    if (formData.urgent) totalPrice += 3000
    if (formData.fragile) totalPrice += 1500

    return Math.round(totalPrice)
  }

  const getPriceBreakdown = () => {
    const weight = Number.parseFloat(formData.weight) || 0
    let basePrice = weight * 500
    if (basePrice < 1000) basePrice = 1000

    const distanceFees: Record<string, number> = {
      "yaounde-douala": 5000,
      "douala-yaounde": 5000,
      "yaounde-bafoussam": 3000,
      "bafoussam-yaounde": 3000,
      "douala-bafoussam": 7000,
      "bafoussam-douala": 7000,
    }

    const route = `${formData.from}-${formData.to}`
    const distanceFee = distanceFees[route] || 2000

    return {
      basePrice,
      distanceFee,
      urgentFee: formData.urgent ? 3000 : 0,
      fragileFee: formData.fragile ? 1500 : 0,
      total: calculatePrice(),
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const priceBreakdown = getPriceBreakdown()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <h1 className="ml-4 text-xl font-bold text-gray-900 dark:text-white">Nouvelle demande de livraison</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Package className="h-5 w-5 mr-2" />
                  Détails de la livraison
                </CardTitle>
                <CardDescription>Remplissez les champs pour créer votre demande</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Route */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="from">Ville de départ</Label>
                      <Select
                        value={formData.from}
                        onValueChange={(value) => handleInputChange("from", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Ville de départ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yaounde">Yaoundé</SelectItem>
                          <SelectItem value="douala">Douala</SelectItem>
                          <SelectItem value="bafoussam">Bafoussam</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.from && <p className="text-xs text-red-500 mt-1">{formErrors.from}</p>}
                    </div>
                    <div>
                      <Label htmlFor="to">Ville de destination</Label>
                      <Select value={formData.to} onValueChange={(value) => handleInputChange("to", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Ville de destination" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yaounde">Yaoundé</SelectItem>
                          <SelectItem value="douala">Douala</SelectItem>
                          <SelectItem value="bafoussam">Bafoussam</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.to && <p className="text-xs text-red-500 mt-1">{formErrors.to}</p>}
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pickupAddress">Adresse de collecte</Label>
                      <Textarea
                        id="pickupAddress"
                        value={formData.pickupAddress}
                        onChange={(e) => handleInputChange("pickupAddress", e.target.value)}
                        placeholder="Adresse complète de collecte"
                      />
                      {formErrors.pickupAddress && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.pickupAddress}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="deliveryAddress">Adresse de livraison</Label>
                      <Textarea
                        id="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={(e) => handleInputChange("deliveryAddress", e.target.value)}
                        placeholder="Adresse complète de livraison"
                      />
                      {formErrors.deliveryAddress && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.deliveryAddress}</p>
                      )}
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="description">Description du colis</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Contenu du colis"
                      />
                      {formErrors.description && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="weight">Poids (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={formData.weight}
                        onChange={(e) => handleInputChange("weight", e.target.value)}
                        placeholder="Ex: 2.5"
                      />
                      {formErrors.weight && <p className="text-xs text-red-500 mt-1">{formErrors.weight}</p>}
                      <p className="text-xs text-gray-500 mt-1">500 FCFA/kg, minimum 1000 FCFA</p>
                    </div>
                  </div>

                  {/* Recipient Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recipientName">Nom du destinataire</Label>
                      <Input
                        id="recipientName"
                        value={formData.recipientName}
                        onChange={(e) => handleInputChange("recipientName", e.target.value)}
                        placeholder="Nom complet"
                      />
                      {formErrors.recipientName && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.recipientName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="recipientPhone">Téléphone du destinataire</Label>
                      <Input
                        id="recipientPhone"
                        value={formData.recipientPhone}
                        onChange={(e) => handleInputChange("recipientPhone", e.target.value)}
                        placeholder="+237 6XX XXX XXX"
                      />
                      {formErrors.recipientPhone && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.recipientPhone}</p>
                      )}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="fragile">Colis fragile (+1500 FCFA)</Label>
                      <Switch
                        id="fragile"
                        checked={formData.fragile}
                        onCheckedChange={(checked) => handleInputChange("fragile", checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="urgent">Livraison urgente (+3000 FCFA)</Label>
                      <Switch
                        id="urgent"
                        checked={formData.urgent}
                        onCheckedChange={(checked) => handleInputChange("urgent", checked)}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Création...
                      </span>
                    ) : (
                      "Créer la demande"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Driver Location Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <MapPin className="h-5 w-5 mr-2" />
                  Suivi du chauffeur
                </CardTitle>
                <CardDescription>
                  Visualisez la position actuelle du chauffeur le plus proche
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <Label>Afficher la carte</Label>
                  <Switch checked={showMap} onCheckedChange={setShowMap} />
                </div>
                {showMap && (
                  <div className="h-64 rounded-lg overflow-hidden">
                    <MapContainer
                      center={driverLocation}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <Marker position={driverLocation}>
                        <Popup>Position actuelle du chauffeur</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Estimation du prix */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Calculator className="h-5 w-5 mr-2" />
                  Estimation du prix
                </CardTitle>
              </CardHeader>
              <CardContent>
                {formData.weight && formData.from && formData.to ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Prix de base ({formData.weight} kg):</span>
                      <span>{priceBreakdown.basePrice.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frais de distance:</span>
                      <span>{priceBreakdown.distanceFee.toLocaleString()} FCFA</span>
                    </div>
                    {priceBreakdown.fragileFee > 0 && (
                      <div className="flex justify-between">
                        <span>Colis fragile:</span>
                        <span>+{priceBreakdown.fragileFee.toLocaleString()} FCFA</span>
                      </div>
                    )}
                    {priceBreakdown.urgentFee > 0 && (
                      <div className="flex justify-between">
                        <span>Livraison urgente:</span>
                        <span>+{priceBreakdown.urgentFee.toLocaleString()} FCFA</span>
                      </div>
                    )}
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-base">
                      <span>Total:</span>
                      <span className="text-blue-600">{priceBreakdown.total.toLocaleString()} FCFA</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <p>• Prix minimum: 1000 FCFA</p>
                      <p>• Tarif: 500 FCFA/kg</p>
                      <p>• Frais variables selon la distance</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Calculator className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Remplissez le formulaire pour voir l'estimation</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}