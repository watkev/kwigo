"use client"

import { useState } from "react"

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      setUploadError("Veuillez sélectionner un fichier image valide")
      return null
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("L'image ne doit pas dépasser 5MB")
      return null
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      // Convertir en base64 pour le stockage local (en production, vous utiliseriez un service cloud)
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // Sauvegarder dans localStorage (en production, vous enverriez vers votre API)
      localStorage.setItem("kwiigo-user-avatar", base64)

      setIsUploading(false)
      return base64
    } catch (error) {
      setIsUploading(false)
      setUploadError("Erreur lors du téléchargement de l'image")
      return null
    }
  }

  return {
    uploadImage,
    isUploading,
    uploadError,
  }
}
