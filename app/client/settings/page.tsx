"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Bell, Globe, Moon, Sun, MapPin, CreditCard, Shield, Trash2, Plus, Edit, Loader2 } from "lucide-react"
import { useSettings } from "@/components/settings-context"
import { useUserData } from "@/components/use-user-data"
import { SettingsWrapper } from "@/components/settings-wrapper"

function SettingsPageContent() {
  const { theme, language, setTheme, setLanguage, t } = useSettings()
  const { settings, saveSettings, isLoading } = useUserData()
  const { toast } = useToast()
  const [localSettings, setLocalSettings] = useState(settings)

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

  const addAddress = async () => {
    const newAddress = {
      id: Date.now().toString(),
      label: t("newAddress"),
      address: t("enterAddress"),
      isDefault: false,
    }

    const newSettings = {
      ...localSettings,
      addresses: [...localSettings.addresses, newAddress],
    }

    setLocalSettings(newSettings)
    await saveSettings(newSettings)

    toast({
      title: t("addressAdded"),
      description: t("addressAddedDesc"),
    })
  }

  const removeAddress = async (id: string) => {
    const newSettings = {
      ...localSettings,
      addresses: localSettings.addresses.filter((addr) => addr.id !== id),
    }

    setLocalSettings(newSettings)
    await saveSettings(newSettings)

    toast({
      title: t("addressRemoved"),
      description: t("addressRemovedDesc"),
    })
  }

  const setDefaultAddress = async (id: string) => {
    const newSettings = {
      ...localSettings,
      addresses: localSettings.addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      })),
    }

    setLocalSettings(newSettings)
    await saveSettings(newSettings)

    toast({
      title: t("defaultAddressSet"),
      description: t("defaultAddressSetDesc"),
    })
  }

  const addPaymentMethod = async () => {
    const newPaymentMethod = {
      id: Date.now().toString(),
      type: "new_method",
      label: t("newPaymentMethod"),
      details: "**** **** ****",
      isDefault: false,
    }

    const newSettings = {
      ...localSettings,
      paymentMethods: [...localSettings.paymentMethods, newPaymentMethod],
    }

    setLocalSettings(newSettings)
    await saveSettings(newSettings)

    toast({
      title: t("paymentMethodAdded"),
      description: t("paymentMethodAddedDesc"),
    })
  }

  const removePaymentMethod = async (id: string) => {
    const newSettings = {
      ...localSettings,
      paymentMethods: localSettings.paymentMethods.filter((method) => method.id !== id),
    }

    setLocalSettings(newSettings)
    await saveSettings(newSettings)

    toast({
      title: t("paymentMethodRemoved"),
      description: t("paymentMethodRemovedDesc"),
    })
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t("settings")}</h1>
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
                  <Label>{t("orderUpdates")}</Label>
                  <p className="text-sm text-muted-foreground">{t("orderUpdatesDesc")}</p>
                </div>
                <Switch
                  checked={localSettings.notifications.orders}
                  onCheckedChange={() => handleNotificationChange("orders")}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("messages")}</Label>
                  <p className="text-sm text-muted-foreground">{t("messagesDesc")}</p>
                </div>
                <Switch
                  checked={localSettings.notifications.messages}
                  onCheckedChange={() => handleNotificationChange("messages")}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("promotions")}</Label>
                  <p className="text-sm text-muted-foreground">{t("promotionsDesc")}</p>
                </div>
                <Switch
                  checked={localSettings.notifications.promotions}
                  onCheckedChange={() => handleNotificationChange("promotions")}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("securityAlerts")}</Label>
                  <p className="text-sm text-muted-foreground">{t("securityAlertsDesc")}</p>
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

        {/* Adresses favorites */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("favoriteAddresses")}
            </CardTitle>
            <CardDescription>{t("manageAddresses")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {localSettings.addresses.map((address) => (
              <div key={address.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{address.label}</span>
                    {address.isDefault && <Badge variant="secondary">{t("defaultAddress")}</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{address.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDefaultAddress(address.id)}
                      disabled={isLoading}
                    >
                      {t("setAsDefault")}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" disabled={isLoading}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => removeAddress(address.id)} disabled={isLoading}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button onClick={addAddress} variant="outline" className="w-full bg-transparent" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              {t("addAddress")}
            </Button>
          </CardContent>
        </Card>

        {/* Méthodes de paiement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t("paymentMethods")}
            </CardTitle>
            <CardDescription>{t("managePayments")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {localSettings.paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{method.label}</span>
                      {method.isDefault && <Badge variant="secondary">{t("defaultAddress")}</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{method.details}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={isLoading}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removePaymentMethod(method.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button onClick={addPaymentMethod} variant="outline" className="w-full bg-transparent" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              {t("addPaymentMethod")}
            </Button>
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

export default function SettingsPage() {
  return (
    <SettingsWrapper>
      <SettingsPageContent />
    </SettingsWrapper>
  )
}
