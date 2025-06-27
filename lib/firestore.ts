import {
  collection,
  addDoc,
  getDocs,
  getDoc, // Ajoutez cette ligne
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore"
import { auth, db } from "./firebase"

// Types
export interface Order {
  id?: string
  clientId: string
  clientName: string
  clientPhone: string
  driverId?: string
  driverName?: string
  from: string
  to: string
  pickupAddress: string
  deliveryAddress: string
  description: string
  weight: string
  fragile: boolean
  urgent: boolean
  recipientName: string
  recipientPhone: string
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled"
  price: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface FirestoreUser {
  id?: string
  name: string
  email: string
  phone: string
  role: "client" | "driver" | "admin"
  city: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface User {
  uid: string
  email: string | null
  name: string
  role: string
  phone: string
  city: string
}

export interface ChatMessage {
  id?: string
  orderId: string
  senderId: string
  senderName: string
  senderRole: "client" | "driver"
  message: string
  timestamp: Timestamp
  read: boolean
}

// Fonction helper pour vérifier l'authentification
const checkAuth = () => {
  const currentUser = auth.currentUser
  console.log("Utilisateur actuel:", currentUser)

  if (!currentUser) {
    throw new Error("Utilisateur non authentifié")
  }

  return currentUser
}

// Orders functions
export const createOrder = async (orderData: Omit<Order, "id" | "createdAt" | "updatedAt">) => {
  try {
    console.log("Création de la commande avec les données:", orderData)
    checkAuth() // Vérifier l'authentification

    const docRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    console.log("Commande créée avec l'ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error)
    throw error
  }
}

export const getOrdersByClient = async (clientId: string) => {
  try {
    console.log("Récupération des commandes pour le client:", clientId)
    checkAuth() // Vérifier l'authentification

    if (!clientId) {
      throw new Error("ID client manquant")
    }

    const q = query(collection(db, "orders"), where("clientId", "==", clientId), orderBy("createdAt", "desc"))

    const querySnapshot = await getDocs(q)
    console.log("Nombre de commandes trouvées:", querySnapshot.size)

    const orders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[]

    console.log("Commandes récupérées:", orders)
    return orders
  } catch (error: any) {
    console.error("Erreur lors de la récupération des commandes client:", error)

    // Si l'erreur est liée à l'index, essayons sans orderBy
    if (error.code === "failed-precondition" || error.message.includes("index")) {
      console.log("Tentative sans orderBy...")
      try {
        const q = query(collection(db, "orders"), where("clientId", "==", clientId))
        const querySnapshot = await getDocs(q)

        const orders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[]

        // Trier manuellement par date
        orders.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0)
          const dateB = b.createdAt?.toDate?.() || new Date(0)
          return dateB.getTime() - dateA.getTime()
        })

        console.log("Commandes récupérées sans orderBy:", orders)
        return orders
      } catch (fallbackError) {
        console.error("Erreur même sans orderBy:", fallbackError)
        throw fallbackError
      }
    }

    throw error
  }
}

export const getAvailableOrders = async () => {
  try {
    console.log("=== DÉBUT getAvailableOrders ===")

    // Vérifier l'authentification
    const currentUser = checkAuth()
    console.log("Utilisateur authentifié:", currentUser.uid, currentUser.email)

    console.log("Connexion à Firestore...")

    // Vérifier la connexion à la base de données
    if (!db) {
      throw new Error("Base de données non initialisée")
    }

    console.log("Création de la requête pour les commandes en attente...")
    const ordersCollection = collection(db, "orders")
    console.log("Collection orders créée:", ordersCollection)

    const q = query(ordersCollection, where("status", "==", "pending"))
    console.log("Requête créée:", q)

    console.log("Exécution de la requête...")
    const querySnapshot = await getDocs(q)
    console.log("Requête exécutée avec succès")
    console.log("Nombre de documents trouvés:", querySnapshot.size)

    if (querySnapshot.empty) {
      console.log("Aucune commande en attente trouvée")
      return []
    }

    console.log("Traitement des documents...")
    const orders: Order[] = []

    querySnapshot.forEach((doc) => {
      console.log("Document ID:", doc.id)
      console.log("Document data:", doc.data())

      const orderData = {
        id: doc.id,
        ...doc.data(),
      } as Order

      orders.push(orderData)
    })

    console.log("Commandes traitées:", orders)

    // Trier manuellement par date
    orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0)
      const dateB = b.createdAt?.toDate?.() || new Date(0)
      return dateB.getTime() - dateA.getTime()
    })

    console.log("Commandes triées:", orders)
    console.log("=== FIN getAvailableOrders ===")
    return orders
  } catch (error: any) {
    console.error("=== ERREUR dans getAvailableOrders ===")
    console.error("Type d'erreur:", typeof error)
    console.error("Message:", error.message)
    console.error("Code:", error.code)
    console.error("Stack:", error.stack)
    console.error("Erreur complète:", error)

    // Si c'est un problème de permissions, donner plus d'infos
    if (error.code === "permission-denied") {
      console.error("PROBLÈME DE PERMISSIONS DÉTECTÉ!")
      console.error("Vérifiez les règles Firestore dans la console Firebase")
      console.error("Utilisateur actuel:", auth.currentUser)
    }

    throw error
  }
}

export const getOrdersByDriver = async (driverId: string) => {
  try {
    console.log("Récupération des commandes pour le chauffeur:", driverId)
    checkAuth() // Vérifier l'authentification

    if (!driverId) {
      throw new Error("ID chauffeur manquant")
    }

    const q = query(collection(db, "orders"), where("driverId", "==", driverId))
    const querySnapshot = await getDocs(q)

    console.log("Nombre de commandes du chauffeur:", querySnapshot.size)

    const orders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[]

    // Trier manuellement par date
    orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0)
      const dateB = b.createdAt?.toDate?.() || new Date(0)
      return dateB.getTime() - dateA.getTime()
    })

    console.log("Commandes du chauffeur récupérées:", orders)
    return orders
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes du chauffeur:", error)
    throw error
  }
}

export const getOrderById = async (orderId: string) => {
  try {
    console.log("Récupération de la commande:", orderId)
    checkAuth()

    const orderRef = doc(db, "orders", orderId)
    const orderDoc = await getDoc(orderRef)

    if (!orderDoc.exists()) {
      throw new Error("Commande introuvable")
    }

    const order = {
      id: orderDoc.id,
      ...orderDoc.data(),
    } as Order

    console.log("Commande récupérée:", order)
    return order
  } catch (error) {
    console.error("Erreur lors de la récupération de la commande:", error)
    throw error
  }
}

export const updateOrderStatus = async (
  orderId: string,
  status: Order["status"],
  driverId?: string,
  driverName?: string,
) => {
  try {
    console.log("Mise à jour du statut de la commande:", orderId, "vers", status)
    checkAuth() // Vérifier l'authentification

    const orderRef = doc(db, "orders", orderId)
    const updateData: any = {
      status,
      updatedAt: Timestamp.now(),
    }

    if (driverId && driverName) {
      updateData.driverId = driverId
      updateData.driverName = driverName
    }

    await updateDoc(orderRef, updateData)

    // Si la commande est terminée, supprimer le chat
    if (status === "completed") {
      await deleteChatMessages(orderId)
    }

    console.log("Statut mis à jour avec succès")
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error)
    throw error
  }
}

export const getAllOrders = async () => {
  try {
    console.log("Récupération de toutes les commandes...")
    checkAuth() // Vérifier l'authentification

    const querySnapshot = await getDocs(collection(db, "orders"))
    console.log("Nombre total de commandes:", querySnapshot.size)

    const orders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[]

    // Trier manuellement par date
    orders.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0)
      const dateB = b.createdAt?.toDate?.() || new Date(0)
      return dateB.getTime() - dateA.getTime()
    })

    console.log("Toutes les commandes récupérées:", orders)
    return orders
  } catch (error) {
    console.error("Erreur lors de la récupération de toutes les commandes:", error)
    throw error
  }
}

// Users functions
export const getAllUsers = async () => {
  try {
    console.log("Récupération de tous les utilisateurs...")
    checkAuth() // Vérifier l'authentification

    const querySnapshot = await getDocs(collection(db, "users"))
    console.log("Nombre total d'utilisateurs:", querySnapshot.size)

    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FirestoreUser[]

    console.log("Tous les utilisateurs récupérés:", users)
    return users
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error)
    throw error
  }
}

// Chat functions
export const sendMessage = async (
  orderId: string,
  senderId: string,
  senderName: string,
  senderRole: "client" | "driver",
  message: string,
) => {
  try {
    console.log("=== DÉBUT ENVOI MESSAGE ===")
    console.log("Paramètres:", { orderId, senderId, senderName, senderRole, message })

    // Remplacer cette ligne :
    // const currentUser = checkAuth()

    // Par cette vérification plus simple :
    if (!senderId || !senderName || !message.trim()) {
      throw new Error("Paramètres manquants pour l'envoi du message")
    }

    const messageData: Omit<ChatMessage, "id"> = {
      orderId,
      senderId,
      senderName,
      senderRole,
      message: message.trim(),
      timestamp: Timestamp.now(),
      read: false,
    }

    console.log("Données du message à envoyer:", messageData)
    console.log("Collection chat_messages:", collection(db, "chat_messages"))

    const docRef = await addDoc(collection(db, "chat_messages"), messageData)
    console.log("Message envoyé avec l'ID:", docRef.id)
    console.log("=== FIN ENVOI MESSAGE ===")

    return docRef.id
  } catch (error) {
    console.error("=== ERREUR ENVOI MESSAGE ===")
    console.error("Type d'erreur:", typeof error)
    console.error("Message d'erreur:", (error as Error).message)
    console.error("Code d'erreur:", (error as any).code)
    console.error("Erreur complète:", error)
    throw error
  }
}

export const getChatMessages = (orderId: string, callback: (messages: ChatMessage[]) => void) => {
  try {
    console.log("Écoute des messages pour la commande:", orderId)

    // Remplacer cette ligne :
    // checkAuth()

    // Par une vérification simple :
    if (!orderId) {
      throw new Error("ID de commande manquant")
    }

    const q = query(collection(db, "chat_messages"), where("orderId", "==", orderId), orderBy("timestamp", "asc"))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[]

      console.log("Messages récupérés:", messages)
      callback(messages)
    })

    return unsubscribe
  } catch (error) {
    console.error("Erreur lors de l'écoute des messages:", error)
    throw error
  }
}

export const markMessagesAsRead = async (orderId: string, userId: string) => {
  try {
    console.log("Marquage des messages comme lus:", { orderId, userId })

    // Remplacer cette ligne :
    // checkAuth()

    // Par une vérification simple :
    if (!orderId || !userId) {
      throw new Error("Paramètres manquants")
    }

    const q = query(
      collection(db, "chat_messages"),
      where("orderId", "==", orderId),
      where("senderId", "!=", userId),
      where("read", "==", false),
    )

    const querySnapshot = await getDocs(q)

    const updatePromises = querySnapshot.docs.map((doc) => updateDoc(doc.ref, { read: true }))

    await Promise.all(updatePromises)
    console.log("Messages marqués comme lus")
  } catch (error) {
    console.error("Erreur lors du marquage des messages:", error)
    throw error
  }
}

export const deleteChatMessages = async (orderId: string) => {
  try {
    console.log("Suppression des messages du chat pour la commande:", orderId)
    checkAuth()

    const q = query(collection(db, "chat_messages"), where("orderId", "==", orderId))
    const querySnapshot = await getDocs(q)

    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)

    console.log("Messages du chat supprimés")
  } catch (error) {
    console.error("Erreur lors de la suppression des messages:", error)
    throw error
  }
}
export const getUserById = async (userId: string) => {
  try {
    console.log("Récupération de l'utilisateur:", userId)
    checkAuth()

    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      throw new Error("Utilisateur introuvable")
    }

    const user = {
      id: userDoc.id,
      ...userDoc.data(),
    } as FirestoreUser

    console.log("Utilisateur récupéré:", user)
    return user
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
    throw error
  }
}