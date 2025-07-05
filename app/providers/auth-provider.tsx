// app/providers/auth-provider.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseAuthUser } from 'firebase/auth';
// CORRECTION ICI : Importez 'app', 'db' et 'auth' comme exportations nommées
import { app, db, auth } from '@/lib/firebase'; 
import { doc, getDoc } from 'firebase/firestore';

// Définissez le type AppUser comme avant, avec uid non-nullable
export interface AppUser {
  uid: string;
  email: string | null;
  name: string; // Nom de l'utilisateur
  role: string; // "client", "driver", "admin"
  phone?: string; // Optionnel
  city?: string;  // Optionnel
  // Ajoutez d'autres champs de profil si nécessaire
}

// CORRECTION ICI : Ajout de 'export' devant l'interface AuthContextType
export interface AuthContextType {
  user: AppUser | null;
  loadingAuth: boolean; // La propriété est bien nommée 'loadingAuth'
  firebaseUser: FirebaseAuthUser | null; // L'objet utilisateur brut de Firebase Auth
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // État de chargement de l'authentification

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => { // Utilisez 'auth' importé
      if (currentUser) {
        setFirebaseUser(currentUser);
        // Récupérer les détails de rôle et de profil de Firestore
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              name: userData.name || currentUser.displayName || currentUser.email || 'Utilisateur',
              role: userData.role || 'client', // Rôle par défaut si non spécifié
              phone: userData.phone || '',
              city: userData.city || '',
            });
          } else {
            // Si le document utilisateur n'existe pas encore (nouvelle inscription)
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              name: currentUser.displayName || currentUser.email || 'Nouvel Utilisateur',
              role: 'client', // Rôle par défaut pour les nouveaux utilisateurs, à ajuster si votre inscription est différente
            });
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du profil utilisateur depuis Firestore:", error);
          // Fallback au minimum si Firestore échoue
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || currentUser.email || 'Utilisateur',
            role: 'client',
          });
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
      }
      setLoadingAuth(false);
    });

    // Nettoyage de l'abonnement
    return () => unsubscribe();
  }, [auth]); // Dépendance sur 'auth'

  return (
    <AuthContext.Provider value={{ user, loadingAuth, firebaseUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
