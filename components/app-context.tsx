"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface AppContextType {
  theme: "light" | "dark"
  language: "fr" | "en"
  setTheme: (theme: "light" | "dark") => void
  setLanguage: (language: "fr" | "en") => void
  t: (key: string) => string
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const translations = {
  fr: {
    // Navigation générale
    dashboard: "Tableau de bord",
    profile: "Profil",
    settings: "Paramètres",
    logout: "Déconnexion",
    hello: "Bonjour",
    welcome: "Bienvenue",

    // Commandes
    orders: "Commandes",
    total: "Total",
    pending: "En attente",
    inProgress: "En cours",
    completed: "Terminées",
    newOrder: "Nouvelle demande de livraison",
    myOrders: "Mes Commandes",
    orderHistory: "Historique des commandes",
    orderDetails: "Détails de la commande",

    // Paramètres
    generalPreferences: "Préférences Générales",
    notifications: "Notifications",
    favoriteAddresses: "Adresses Favorites",
    paymentMethods: "Méthodes de Paiement",
    security: "Sécurité et Confidentialité",
    language: "Langue",
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",

    // Actions
    save: "Sauvegarder",
    cancel: "Annuler",
    edit: "Modifier",
    delete: "Supprimer",
    add: "Ajouter",
    confirm: "Confirmer",
    close: "Fermer",
    back: "Retour",
    next: "Suivant",
    previous: "Précédent",

    // Profil
    personalInfo: "Informations Personnelles",
    managePersonalInfo: "Gérez vos informations personnelles et de contact",
    fullName: "Nom complet",
    email: "Adresse e-mail",
    phone: "Numéro de téléphone",
    address: "Adresse",
    memberSince: "Membre depuis",
    statistics: "Statistiques",
    badges: "Badges",

    // Notifications
    orderUpdates: "Mises à jour de commandes",
    orderUpdatesDesc: "Notifications sur le statut de vos livraisons",
    messages: "Messages",
    messagesDesc: "Messages des chauffeurs et support",
    promotions: "Promotions",
    promotionsDesc: "Offres spéciales et codes de réduction",
    securityAlerts: "Sécurité",
    securityAlertsDesc: "Alertes de sécurité et connexions",

    // Adresses
    manageAddresses: "Gérez vos adresses fréquemment utilisées",
    setAsDefault: "Définir par défaut",
    defaultAddress: "Par défaut",
    addAddress: "Ajouter une adresse",
    newAddress: "Nouvelle adresse",
    enterAddress: "Entrez votre adresse",

    // Paiements
    managePayments: "Gérez vos moyens de paiement enregistrés",
    addPaymentMethod: "Ajouter un moyen de paiement",
    newPaymentMethod: "Nouveau moyen",

    // Sécurité
    manageSecuritySettings: "Gérez vos paramètres de sécurité",
    changePassword: "Changer le mot de passe",
    twoFactorAuth: "Authentification à deux facteurs",
    downloadData: "Télécharger mes données",
    deleteAccount: "Supprimer mon compte",

    // Messages de succès/erreur
    profileUpdated: "Profil mis à jour",
    profileUpdatedDesc: "Vos informations ont été sauvegardées avec succès.",
    error: "Erreur",
    profileSaveError: "Impossible de sauvegarder le profil.",
    photoUpdated: "Photo mise à jour",
    photoUpdatedDesc: "Votre photo de profil a été mise à jour.",
    languageUpdated: "Langue mise à jour",
    themeUpdated: "Thème mis à jour",
    themeChangedTo: "Thème changé vers",
    notificationUpdated: "Notification mise à jour",
    addressAdded: "Adresse ajoutée",
    addressAddedDesc: "Nouvelle adresse ajoutée à vos favoris.",
    addressRemoved: "Adresse supprimée",
    addressRemovedDesc: "L'adresse a été supprimée de vos favoris.",
    defaultAddressSet: "Adresse par défaut",
    defaultAddressSetDesc: "Adresse définie comme adresse par défaut.",
    paymentMethodAdded: "Moyen de paiement ajouté",
    paymentMethodAddedDesc: "Nouveau moyen de paiement ajouté.",
    paymentMethodRemoved: "Moyen de paiement supprimé",
    paymentMethodRemovedDesc: "Le moyen de paiement a été supprimé.",

    // Chauffeur spécifique
    driverDashboard: "Tableau de bord Chauffeur",
    vehicleInfo: "Informations du Véhicule",
    manageVehicleInfo: "Gérez les informations de votre véhicule",
    brand: "Marque",
    model: "Modèle",
    year: "Année",
    color: "Couleur",
    licensePlate: "Plaque d'immatriculation",
    vehicleType: "Type de véhicule",
    motorcycle: "Moto",
    car: "Voiture",
    van: "Camionnette",
    documents: "Documents",
    manageDocuments: "Gérez vos documents et leurs dates d'expiration",
    drivingLicense: "Permis de conduire",
    insurance: "Assurance",
    registration: "Carte grise",
    expiresOn: "Expire le",
    valid: "Valide",
    expiringSoon: "Expire bientôt",
    expired: "Expiré",
    renew: "Renouveler",
    workPreferences: "Préférences de Travail",
    configureWorkPrefs: "Configurez vos heures et zones de travail préférées",
    startTime: "Heure de début",
    endTime: "Heure de fin",
    maxDistance: "Distance maximale (km)",
    preferredZones: "Zones préférées",
    modifyZones: "Modifier les zones",
    newOrdersNotif: "Nouvelles commandes",
    newOrdersNotifDesc: "Notifications pour les nouvelles demandes de course",
    orderUpdatesNotif: "Mises à jour de commandes",
    orderUpdatesNotifDesc: "Changements de statut des commandes",
    paymentsNotif: "Paiements",
    paymentsNotifDesc: "Notifications de paiements et gains",

    // Statistiques
    totalOrders: "Total commandes",
    completedOrders: "Commandes terminées",
    averageRating: "Note moyenne",
    successRate: "Taux de réussite",
    favoriteAddressesCount: "adresses favorites",

    // Badges
    loyalClient: "Client Fidèle",
    reviewer: "Évaluateur",
    punctual: "Ponctuel",

    // États de chargement
    loading: "Chargement...",
    saving: "Sauvegarde...",
    uploading: "Téléchargement...",

    // Divers
    client: "Client",
    driver: "Chauffeur",
    kwiigo: "KwiiGo",
    clientKwiigo: "Client KwiiGo",
    driverKwiigo: "Chauffeur KwiiGo",
    configureLanguageAndTheme: "Configurez la langue et l'apparence de l'application",
    manageNotificationPrefs: "Gérez vos préférences de notifications",
    chooseLanguage: "Choisir une langue",
    french: "Français",
    english: "English",
    saveChanges: "Sauvegarder les modifications",
  },
  en: {
    // General navigation
    dashboard: "Dashboard",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    hello: "Hello",
    welcome: "Welcome",

    // Orders
    orders: "Orders",
    total: "Total",
    pending: "Pending",
    inProgress: "In Progress",
    completed: "Completed",
    newOrder: "New delivery request",
    myOrders: "My Orders",
    orderHistory: "Order History",
    orderDetails: "Order Details",

    // Settings
    generalPreferences: "General Preferences",
    notifications: "Notifications",
    favoriteAddresses: "Favorite Addresses",
    paymentMethods: "Payment Methods",
    security: "Security & Privacy",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",

    // Actions
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    confirm: "Confirm",
    close: "Close",
    back: "Back",
    next: "Next",
    previous: "Previous",

    // Profile
    personalInfo: "Personal Information",
    managePersonalInfo: "Manage your personal and contact information",
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    address: "Address",
    memberSince: "Member since",
    statistics: "Statistics",
    badges: "Badges",

    // Notifications
    orderUpdates: "Order Updates",
    orderUpdatesDesc: "Notifications about your delivery status",
    messages: "Messages",
    messagesDesc: "Messages from drivers and support",
    promotions: "Promotions",
    promotionsDesc: "Special offers and discount codes",
    securityAlerts: "Security",
    securityAlertsDesc: "Security alerts and login notifications",

    // Addresses
    manageAddresses: "Manage your frequently used addresses",
    setAsDefault: "Set as default",
    defaultAddress: "Default",
    addAddress: "Add address",
    newAddress: "New address",
    enterAddress: "Enter your address",

    // Payments
    managePayments: "Manage your saved payment methods",
    addPaymentMethod: "Add payment method",
    newPaymentMethod: "New method",

    // Security
    manageSecuritySettings: "Manage your security settings",
    changePassword: "Change password",
    twoFactorAuth: "Two-factor authentication",
    downloadData: "Download my data",
    deleteAccount: "Delete my account",

    // Success/Error messages
    profileUpdated: "Profile updated",
    profileUpdatedDesc: "Your information has been saved successfully.",
    error: "Error",
    profileSaveError: "Unable to save profile.",
    photoUpdated: "Photo updated",
    photoUpdatedDesc: "Your profile photo has been updated.",
    languageUpdated: "Language updated",
    themeUpdated: "Theme updated",
    themeChangedTo: "Theme changed to",
    notificationUpdated: "Notification updated",
    addressAdded: "Address added",
    addressAddedDesc: "New address added to your favorites.",
    addressRemoved: "Address removed",
    addressRemovedDesc: "The address has been removed from your favorites.",
    defaultAddressSet: "Default address",
    defaultAddressSetDesc: "Address set as default address.",
    paymentMethodAdded: "Payment method added",
    paymentMethodAddedDesc: "New payment method added.",
    paymentMethodRemoved: "Payment method removed",
    paymentMethodRemovedDesc: "The payment method has been removed.",

    // Driver specific
    driverDashboard: "Driver Dashboard",
    vehicleInfo: "Vehicle Information",
    manageVehicleInfo: "Manage your vehicle information",
    brand: "Brand",
    model: "Model",
    year: "Year",
    color: "Color",
    licensePlate: "License Plate",
    vehicleType: "Vehicle Type",
    motorcycle: "Motorcycle",
    car: "Car",
    van: "Van",
    documents: "Documents",
    manageDocuments: "Manage your documents and their expiration dates",
    drivingLicense: "Driving License",
    insurance: "Insurance",
    registration: "Registration",
    expiresOn: "Expires on",
    valid: "Valid",
    expiringSoon: "Expiring Soon",
    expired: "Expired",
    renew: "Renew",
    workPreferences: "Work Preferences",
    configureWorkPrefs: "Configure your working hours and preferred zones",
    startTime: "Start Time",
    endTime: "End Time",
    maxDistance: "Maximum Distance (km)",
    preferredZones: "Preferred Zones",
    modifyZones: "Modify zones",
    newOrdersNotif: "New Orders",
    newOrdersNotifDesc: "Notifications for new ride requests",
    orderUpdatesNotif: "Order Updates",
    orderUpdatesNotifDesc: "Order status changes",
    paymentsNotif: "Payments",
    paymentsNotifDesc: "Payment and earnings notifications",

    // Statistics
    totalOrders: "Total orders",
    completedOrders: "Completed orders",
    averageRating: "Average rating",
    successRate: "Success rate",
    favoriteAddressesCount: "favorite addresses",

    // Badges
    loyalClient: "Loyal Client",
    reviewer: "Reviewer",
    punctual: "Punctual",

    // Loading states
    loading: "Loading...",
    saving: "Saving...",
    uploading: "Uploading...",

    // Miscellaneous
    client: "Client",
    driver: "Driver",
    kwiigo: "KwiiGo",
    clientKwiigo: "KwiiGo Client",
    driverKwiigo: "KwiiGo Driver",
    configureLanguageAndTheme: "Configure the language and appearance of the application",
    manageNotificationPrefs: "Manage your notification preferences",
    chooseLanguage: "Choose a language",
    french: "Français",
    english: "English",
    saveChanges: "Save changes",
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

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return (
    <AppContext.Provider
      value={{
        theme,
        language,
        setTheme,
        setLanguage,
        t,
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
