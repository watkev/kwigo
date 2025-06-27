"use client"

import { useState, useEffect } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useRouter } from "next/navigation"

interface User {
  uid: string
  email: string | null
  name: string
  role: string
  phone: string
  city: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            const userInfo: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.name,
              role: userData.role,
              phone: userData.phone,
              city: userData.city,
            }
            setUser(userInfo)
            localStorage.setItem("kwiigo_user", JSON.stringify(userInfo))
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error)
        }
      } else {
        setUser(null)
        localStorage.removeItem("kwiigo_user")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      localStorage.removeItem("kwiigo_user")
      router.push("/")
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  return { user, loading, logout }
}
