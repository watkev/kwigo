"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./use-auth-simple"

interface UserProfile {
  fullName: string
  email: string
  phone: string
  address: string
  avatar: string
  joinDate: string
}

interface UserSettings {
  notifications: {
    orders: boolean
    promotions: boolean
    messages: boolean
    security: boolean
  }
  addresses: Array<{
    id: string
    label: string
    address: string
    isDefault: boolean
  }>
  paymentMethods: Array<{
    id: string
    type: string
    label: string
    details: string
    isDefault: boolean
  }>
}

const defaultProfile: UserProfile = {
  fullName: "Kevin Watong",
  email: "kevin.watong@example.com",
  phone: "+237 6XX XXX XXX",
  address: "Douala, Cameroun",
  avatar: "",
  joinDate: "15 Mars 2024",
}

const defaultSettings: UserSettings = {
  notifications: {
    orders: true,
    promotions: false,
    messages: true,
    security: true,
  },
  addresses: [
    { id: "1", label: "Domicile", address: "Douala, Bonanjo", isDefault: true },
    { id: "2", label: "Bureau", address: "Yaoundé, Centre-ville", isDefault: false },
    { id: "3", label: "Famille", address: "Bafoussam, Cameroun", isDefault: false },
  ],
  paymentMethods: [
    { id: "1", type: "orange_money", label: "Orange Money", details: "**** **** 1234", isDefault: true },
    { id: "2", type: "mtn_momo", label: "MTN Mobile Money", details: "**** **** 5678", isDefault: false },
  ],
}

export function useUserData() {
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<UserProfile>(defaultProfile)
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [isLoading, setSaveLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      // Charger les données depuis localStorage avec l'ID utilisateur
      const userId = user.uid || "default-user"
      const savedProfile = localStorage.getItem(`kwiigo-user-profile-${userId}`)
      const savedSettings = localStorage.getItem(`kwiigo-user-settings-${userId}`)
      const savedAvatar = localStorage.getItem(`kwiigo-user-avatar-${userId}`)

      if (savedProfile) {
        setProfile(JSON.parse(savedProfile))
      } else {
        // Utiliser les données de l'utilisateur comme base
        setProfile((prev) => ({
          ...prev,
          fullName: user.displayName || prev.fullName,
          email: user.email || prev.email,
        }))
      }

      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }

      if (savedAvatar) {
        setProfile((prev) => ({ ...prev, avatar: savedAvatar }))
      }
    }
  }, [user, isAuthenticated])

  const saveProfile = async (newProfile: UserProfile) => {
    if (!user) return false

    setSaveLoading(true)
    try {
      // Simuler un délai d'API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const userId = user.uid || "default-user"
      localStorage.setItem(`kwiigo-user-profile-${userId}`, JSON.stringify(newProfile))
      setProfile(newProfile)
      setSaveLoading(false)
      return true
    } catch (error) {
      setSaveLoading(false)
      return false
    }
  }

  const saveSettings = async (newSettings: UserSettings) => {
    if (!user) return false

    setSaveLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const userId = user.uid || "default-user"
      localStorage.setItem(`kwiigo-user-settings-${userId}`, JSON.stringify(newSettings))
      setSettings(newSettings)
      setSaveLoading(false)
      return true
    } catch (error) {
      setSaveLoading(false)
      return false
    }
  }

  const updateAvatar = (avatarUrl: string) => {
    if (!user) return

    const userId = user.uid || "default-user"
    localStorage.setItem(`kwiigo-user-avatar-${userId}`, avatarUrl)
    setProfile((prev) => ({ ...prev, avatar: avatarUrl }))
  }

  return {
    profile,
    settings,
    isLoading,
    saveProfile,
    saveSettings,
    updateAvatar,
  }
}
