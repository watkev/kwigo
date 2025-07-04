"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface AppContextType {
  theme: "light" | "dark"
  language: "fr" | "en"
  setTheme: (theme: "light" | "dark") => void
  setLanguage: (language: "fr" | "en") => void
  translations: Record<string, string>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const translations = {
  fr: {
    dashboard: "Tableau de bord",
    profile: "Profil",
    settings: "Paramètres",
    logout: "Déconnexion",
    hello: "Bonjour",
    orders: "Commandes",
    total: "Total",
    pending: "En attente",
    inProgress: "En cours",
    completed: "Terminées",
    newOrder: "Nouvelle demande de livraison",
    myOrders: "Mes Commandes",
    generalPreferences: "Préférences Générales",
    notifications: "Notifications",
    favoriteAddresses: "Adresses Favorites",
    paymentMethods: "Méthodes de Paiement",
    security: "Sécurité et Confidentialité",
    language: "Langue",
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
    save: "Sauvegarder",
    cancel: "Annuler",
    edit: "Modifier",
    delete: "Supprimer",
    add: "Ajouter",
  },
  en: {
    dashboard: "Dashboard",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    hello: "Hello",
    orders: "Orders",
    total: "Total",
    pending: "Pending",
    inProgress: "In Progress",
    completed: "Completed",
    newOrder: "New delivery request",
    myOrders: "My Orders",
    generalPreferences: "General Preferences",
    notifications: "Notifications",
    favoriteAddresses: "Favorite Addresses",
    paymentMethods: "Payment Methods",
    security: "Security & Privacy",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
  },
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<"light" | "dark">("light")
  const [language, setLanguageState] = useState<"fr" | "en">("fr")

  useEffect(() => {
    // Charger les préférences depuis localStorage
    const savedTheme = localStorage.getItem("kwiigo-theme") as "light" | "dark" | null
    const savedLanguage = localStorage.getItem("kwiigo-language") as "fr" | "en" | null

    if (savedTheme) {
      setThemeState(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }
    if (savedLanguage) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme)
    localStorage.setItem("kwiigo-theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const setLanguage = (newLanguage: "fr" | "en") => {
    setLanguageState(newLanguage)
    localStorage.setItem("kwiigo-language", newLanguage)
  }

  return (
    <AppContext.Provider
      value={{
        theme,
        language,
        setTheme,
        setLanguage,
        translations: translations[language],
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
