// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
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

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
