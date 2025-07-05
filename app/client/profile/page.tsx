"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Camera, Edit2, Save, X, Star, MapPin, Calendar, Loader2 } from "lucide-react"
import { useUserData } from "@/components/use-user-data"
import { useImageUpload } from "@/components/use-image-upload"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfilePage() {
  const { profile, saveProfile, updateAvatar, isLoading } = useUserData()
  const { uploadImage, isUploading } = useImageUpload()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState(profile)

  useEffect(() => {
    setEditedProfile(profile)
  }, [profile])

  const handleSave = async () => {
    try {
      const success = await saveProfile(editedProfile)
      if (success) {
        setIsEditing(false)
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été sauvegardées avec succès.",
        })
      } else {
        throw new Error("Échec de la sauvegarde")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du profil.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const imageUrl = await uploadImage(file)
      if (imageUrl) {
        await updateAvatar(imageUrl)
        setEditedProfile((prev) => ({ ...prev, avatar: imageUrl }))
        toast({
          title: "Photo mise à jour",
          description: "Votre photo de profil a été mise à jour avec succès.",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la photo de profil.",
        variant: "destructive",
      })
    }
  }

  const stats = {
    totalOrders: 15,
    completedOrders: 12,
    averageRating: 4.8,
    favoriteAddresses: 3,
  }

  const formatJoinDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' }
    return new Date(dateString).toLocaleDateString('fr-FR', options)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos informations personnelles et vos préférences
            </p>
          </div>
          
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)} 
              className="gap-2"
              variant="outline"
            >
              <Edit2 className="h-4 w-4" />
              Modifier le profil
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleCancel}
                variant="outline" 
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Annuler
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Enregistrer
              </Button>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="border-b">
                <CardTitle className="text-xl">Informations personnelles</CardTitle>
                <CardDescription>
                  Ces informations seront visibles par les livreurs et autres utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <Avatar className="h-24 w-24">
                        {profile.avatar ? (
                          <AvatarImage src={profile.avatar} alt={profile.fullName} />
                        ) : (
                          <AvatarFallback className="text-2xl bg-gradient-to-r from-primary to-secondary text-white">
                            {profile.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      {isEditing && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="avatar-upload"
                            disabled={isUploading}
                          />
                          <label 
                            htmlFor="avatar-upload"
                            className="cursor-pointer p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
                          >
                            {isUploading ? (
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            ) : (
                              <Camera className="h-5 w-5 text-primary" />
                            )}
                          </label>
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <Label htmlFor="avatar-upload" className="text-sm text-center text-muted-foreground cursor-pointer">
                        Cliquez pour changer
                      </Label>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {isLoading ? <Skeleton className="h-6 w-48" /> : profile.fullName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {stats.averageRating}/5
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Client KwiiGo
                        </span>
                      </div>
                    </div>

                    <Separator />

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nom complet</Label>
                        {isLoading ? (
                          <Skeleton className="h-9 w-full" />
                        ) : (
                          <Input
                            id="fullName"
                            value={editedProfile.fullName}
                            onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                            disabled={!isEditing}
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Adresse e-mail</Label>
                        {isLoading ? (
                          <Skeleton className="h-9 w-full" />
                        ) : (
                          <Input
                            id="email"
                            type="email"
                            value={editedProfile.email}
                            onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                            disabled={!isEditing}
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        {isLoading ? (
                          <Skeleton className="h-9 w-full" />
                        ) : (
                          <Input
                            id="phone"
                            value={editedProfile.phone}
                            onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                            disabled={!isEditing}
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Adresse principale</Label>
                        {isLoading ? (
                          <Skeleton className="h-9 w-full" />
                        ) : (
                          <Input
                            id="address"
                            value={editedProfile.address}
                            onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                            disabled={!isEditing}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 mt-8 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Membre depuis {formatJoinDate(profile.joinDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{stats.favoriteAddresses} adresse(s) enregistrée(s)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Badges */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Commandes totales", value: stats.totalOrders, icon: null },
                  { label: "Commandes terminées", value: stats.completedOrders, icon: null },
                  { 
                    label: "Note moyenne", 
                    value: stats.averageRating, 
                    icon: <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /> 
                  },
                  { label: "Taux de réussite", value: `${Math.round((stats.completedOrders / stats.totalOrders) * 100)}%`, icon: null },
                ].map((stat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <div className="flex items-center gap-1 font-medium">
                      {stat.icon}
                      <span>{stat.value}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Badges Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Récompenses</CardTitle>
                <CardDescription>Vos badges de réussite</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Client Fidèle", variant: "default" },
                    { label: "Évaluateur", variant: "secondary" },
                    { label: "Ponctuel", variant: "outline" },
                    { label: "Top Client", variant: "default" },
                  ].map((badge, index) => (
                    <Badge key={index} variant={badge.variant as any} className="px-3 py-1">
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Preferences Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Préférences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Notifications</Label>
                    <Button variant="outline" size="sm">
                      Gérer
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="language">Langue</Label>
                    <Button variant="outline" size="sm">
                      Français
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}