"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Bell, Globe, Moon, Sun, MapPin, Shield, Car, FileText, Clock } from "lucide-react"
import { useSettings } from "@/components/settings-context"
import { useUserData } from "@/components/use-user-data"
import { SettingsWrapper } from "@/components/settings-wrapper"

interface VehicleInfo {
  brand: string
  model: string
  year: string
  color: string
  licensePlate: string
  type: "motorcycle" | "car" | "van"
}

interface Document {
  id: string
  type: string
  name: string
  expiryDate: string
  status: "valid" | "expiring" | "expired"
}

function DriverSettingsPageContent() {
  const { theme, language, setTheme, setLanguage, t } = useSettings()
  const { settings, saveSettings, isLoading } = useUserData()
  const { toast } = useToast()
  const [localSettings, setLocalSettings] = useState(settings)

  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    brand: "Toyota",
    model: "Corolla",
    year: "2020",
    color: "Bleu",
    licensePlate: "ABC-123-CD",
    type: "car",
  })

  const [documents, setDocuments] = useState<Document[]>([
    { id: "1", type: t("drivingLicense"), name: "permis.pdf", expiryDate: "2025-12-31", status: "valid" },
    { id: "2", type: t("insurance"), name: "assurance.pdf", expiryDate: "2024-08-15", status: "expiring" },
    { id: "3", type: t("registration"), name: "carte_grise.pdf", expiryDate: "2026-03-20", status: "valid" },
  ])

  const [workPreferences, setWorkPreferences] = useState({
    availableHours: { start: "08:00", end: "18:00" },
    preferredZones: ["Douala Centre", "Bonanjo", "Akwa"],
    maxDistance: 25,
  })

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleLanguageChange = (value: "fr" | "en") => {
    setLanguage(value)
    toast({
      title: t("languageUpdated"),
      description: `${t("languageUpdated")} ${value === "fr" ? t("french") : t("english")}`,
    })
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    toast({
      title: t("themeUpdated"),
      description: `${t("themeChangedTo")} ${newTheme === "light" ? t("light") : t("dark")}`,
    })
  }

  const handleNotificationChange = async (type: keyof typeof settings.notifications) => {
    const newNotifications = {
      ...localSettings.notifications,
      [type]: !localSettings.notifications[type],
    }

    const newSettings = {
      ...localSettings,
      notifications: newNotifications,
    }

    setLocalSettings(newSettings)

    const success = await saveSettings(newSettings)
    if (success) {
      toast({
        title: t("notificationUpdated"),
        description: `${t("notificationUpdated")} ${type}`,
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "expiring":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "valid":
        return t("valid")
      case "expiring":
        return t("expiringSoon")
      case "expired":
        return t("expired")
      default:
        return "Inconnu"
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {t("settings")} {t("driver")}
        </h1>
      </div>

      <div className="space-y-6">
        {/* Préférences générales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t("generalPreferences")}
            </CardTitle>
            <CardDescription>{t("configureLanguageAndTheme")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="language">{t("language")}</Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("chooseLanguage")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">{t("french")}</SelectItem>
                    <SelectItem value="en">{t("english")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("theme")}</Label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {theme === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span className="text-sm">{theme === "light" ? t("light") : t("dark")}</span>
                  </div>
                  <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations du véhicule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              {t("vehicleInfo")}
            </CardTitle>
            <CardDescription>{t("manageVehicleInfo")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">{t("brand")}</Label>
                <Input
                  id="brand"
                  value={vehicleInfo.brand}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, brand: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">{t("model")}</Label>
                <Input
                  id="model"
                  value={vehicleInfo.model}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, model: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">{t("year")}</Label>
                <Input
                  id="year"
                  value={vehicleInfo.year}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, year: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">{t("color")}</Label>
                <Input
                  id="color"
                  value={vehicleInfo.color}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, color: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licensePlate">{t("licensePlate")}</Label>
                <Input
                  id="licensePlate"
                  value={vehicleInfo.licensePlate}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, licensePlate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">{t("vehicleType")}</Label>
                <Select
                  value={vehicleInfo.type}
                  onValueChange={(value: any) => setVehicleInfo({ ...vehicleInfo, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motorcycle">{t("motorcycle")}</SelectItem>
                    <SelectItem value="car">{t("car")}</SelectItem>
                    <SelectItem value="van">{t("van")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full md:w-auto">{t("saveChanges")}</Button>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("documents")}
            </CardTitle>
            <CardDescription>{t("manageDocuments")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("expiresOn")} {doc.expiryDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(doc.status)}>{getStatusText(doc.status)}</Badge>
                  <Button variant="outline" size="sm">
                    {t("renew")}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Préférences de travail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t("workPreferences")}
            </CardTitle>
            <CardDescription>{t("configureWorkPrefs")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">{t("startTime")}</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={workPreferences.availableHours.start}
                  onChange={(e) =>
                    setWorkPreferences({
                      ...workPreferences,
                      availableHours: { ...workPreferences.availableHours, start: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">{t("endTime")}</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={workPreferences.availableHours.end}
                  onChange={(e) =>
                    setWorkPreferences({
                      ...workPreferences,
                      availableHours: { ...workPreferences.availableHours, end: e.target.value },
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxDistance">{t("maxDistance")}</Label>
              <Input
                id="maxDistance"
                type="number"
                value={workPreferences.maxDistance}
                onChange={(e) =>
                  setWorkPreferences({
                    ...workPreferences,
                    maxDistance: Number.parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{t("preferredZones")}</Label>
              <div className="flex flex-wrap gap-2">
                {workPreferences.preferredZones.map((zone, index) => (
                  <Badge key={index} variant="secondary">
                    {zone}
                  </Badge>
                ))}
              </div>
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                {t("modifyZones")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t("notifications")}
            </CardTitle>
            <CardDescription>{t("manageNotificationPrefs")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("newOrdersNotif")}</Label>
                  <p className="text-sm text-muted-foreground">{t("newOrdersNotifDesc")}</p>
                </div>
                <Switch
                  checked={localSettings.notifications.orders}
                  onCheckedChange={() => handleNotificationChange("orders")}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("orderUpdatesNotif")}</Label>
                  <p className="text-sm text-muted-foreground">{t("orderUpdatesNotifDesc")}</p>
                </div>
                <Switch
                  checked={localSettings.notifications.messages}
                  onCheckedChange={() => handleNotificationChange("messages")}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("paymentsNotif")}</Label>
                  <p className="text-sm text-muted-foreground">{t("paymentsNotifDesc")}</p>
                </div>
                <Switch
                  checked={localSettings.notifications.security}
                  onCheckedChange={() => handleNotificationChange("security")}
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sécurité et confidentialité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("security")}
            </CardTitle>
            <CardDescription>{t("manageSecuritySettings")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start bg-transparent">
              {t("changePassword")}
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              {t("twoFactorAuth")}
            </Button>
            <Button variant="outline" className="w-full justify-start bg-transparent">
              {t("downloadData")}
            </Button>
            <Separator />
            <Button variant="destructive" className="w-full">
              {t("deleteAccount")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DriverSettingsPage() {
  return (
    <SettingsWrapper>
      <DriverSettingsPageContent />
    </SettingsWrapper>
  )
}
