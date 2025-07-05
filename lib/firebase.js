// lib/firebase.ts
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app" // Ajoutez getApps et getApp pour l'initialisation conditionnelle
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCd-LWtGASK2EgYAljktKrdqHjfW55nwIU",
  authDomain: "kwiigo.firebaseapp.com",
  projectId: "kwiigo",
  storageBucket: "kwiigo.firebasestorage.app",
  messagingSenderId: "639269440296",
  appId: "1:639269440296:web:c9a89e35faebbf84581e1d",
  measurementId: "G-2SWCPV1BBK",
}

// Initialize Firebase App only if it hasn't been initialized already
// This prevents "Firebase: No Firebase App '[DEFAULT]' has been created" errors in Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Export 'app' as a named export, alongside other services
// REMPLACER "export default app" PAR CETTE LIGNE
export { app };