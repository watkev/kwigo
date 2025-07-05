"use client";

import { useState, useEffect } from "react";

// Updated UserProfile interface to include 'uid', 'role', and 'city'
export interface UserProfile {
  uid?: string; // Often a unique identifier, making it optional here
  fullName: string;
  email: string;
  phone?: string; // Made optional
  address?: string; // Made optional
  avatar: string;
  joinDate: string;
  role?: string; // Added 'role' property (optional)
  city?: string; // Added 'city' property (optional)
}

export interface UserSettings {
  notifications: {
    orders: boolean;
    promotions: boolean;
    messages: boolean;
    security: boolean;
  };
  addresses: Array<{
    id: string;
    label: string;
    address: string;
    isDefault: boolean;
  }>;
  paymentMethods: Array<{
    id: string;
    type: string;
    label: string;
    details: string;
    isDefault: boolean;
  }>;
}

const defaultProfile: UserProfile = {
  uid: "default-user-id", // Example default UID
  fullName: "Kevin Watong",
  email: "kevin.watong@example.com",
  phone: "+237 6XX XXX XXX",
  address: "Douala, Cameroun",
  avatar: "",
  joinDate: "15 Mars 2024",
  role: "client", // Default role
  city: "Douala", // Default city
};

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
};

export function useUserData() {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    // Charger les données depuis localStorage
    const savedProfile = localStorage.getItem("kwiigo-user-profile");
    const savedSettings = localStorage.getItem("kwiigo-user-settings");
    const savedAvatar = localStorage.getItem("kwiigo-user-avatar");

    if (savedProfile) {
      // Parse the saved profile and ensure it matches the UserProfile interface
      const parsedProfile: UserProfile = JSON.parse(savedProfile);
      setProfile((prev) => ({
        ...prev, // Keep default values for any missing fields
        ...parsedProfile,
        // Ensure avatar is loaded from localStorage if it exists
        avatar: savedAvatar || parsedProfile.avatar || "",
      }));
    } else if (savedAvatar) {
        // If no full profile saved but avatar is, update only avatar
        setProfile((prev) => ({ ...prev, avatar: savedAvatar }));
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveProfile = async (newProfile: UserProfile) => {
    setSaveLoading(true);
    try {
      // Simuler un délai d'API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      localStorage.setItem("kwiigo-user-profile", JSON.stringify(newProfile));
      // Save avatar separately if you manage it differently
      if (newProfile.avatar) {
        localStorage.setItem("kwiigo-user-avatar", newProfile.avatar);
      }
      setProfile(newProfile);
      setSaveLoading(false);
      return true;
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveLoading(false);
      return false;
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    setSaveLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      localStorage.setItem("kwiigo-user-settings", JSON.stringify(newSettings));
      setSettings(newSettings);
      setSaveLoading(false);
      return true;
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveLoading(false);
      return false;
    }
  };

  const updateAvatar = (avatarUrl: string) => {
    setProfile((prev) => ({ ...prev, avatar: avatarUrl }));
    localStorage.setItem("kwiigo-user-avatar", avatarUrl); // Also save to localStorage
  };

  return {
    profile,
    settings,
    isLoading,
    saveProfile,
    saveSettings,
    updateAvatar,
  };
}
