import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'; 
import { db } from '@/lib/firebase'; // Assurez-vous d'avoir ce chemin vers votre instance Firestore

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fonction fictive pour récupérer les gains du chauffeur depuis Firestore
async function getDriverEarnings(driverId: string) {
  try {
    const q = query(collection(db, "orders"), where("driverId", "==", driverId), where("status", "==", "completed"));
    const querySnapshot = await getDocs(q);
    let totalEarnings = 0;
    querySnapshot.forEach((doc) => {
      totalEarnings += doc.data().price || 0; // Supposons que le prix est ce qui revient au chauffeur
    });
    return totalEarnings;
  } catch (error) {
    console.error("Error fetching driver earnings from Firestore:", error);
    return 0;
  }
}

// Fonction fictive pour récupérer les prochaines livraisons d'un chauffeur
async function getDriverNextDeliveries(driverId: string) {
    try {
        const q = query(collection(db, "orders"), where("driverId", "==", driverId), where("status", "==", "assigned")); // ou "in_transit"
        const querySnapshot = await getDocs(q);
        const deliveries: any[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            deliveries.push({
                orderId: doc.id,
                description: data.description,
                deliveryAddress: data.deliveryAddress,
                recipientName: data.recipientName,
                status: data.status,
            });
        });
        return deliveries;
    } catch (error) {
        console.error("Error fetching driver next deliveries:", error);
        return [];
    }
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { message, userRole } = req.body; // userRole sera "driver" ici

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ message: 'Message is required and must be a string' });
  }

  // TODO: Récupérer l'ID du chauffeur depuis la session/authentification (très important pour la sécurité)
  // Pour l'instant, on utilisera un ID fictif ou passé en dur pour les tests.
  // En production, ne jamais faire confiance à l'ID reçu du frontend directement.
  const driverId = "driver_test_id"; // REMPLACER CECI PAR L'ID RÉEL DU CHAUFFEUR AUTHENTIFIÉ

  let systemPrompt = `Vous êtes Kwigo AI, un assistant virtuel multilingue (français et anglais) pour les chauffeurs de la plateforme Kwigo. 
    Votre rôle est de les assister dans leurs missions, la navigation, les politiques de l'entreprise, l'optimisation des gains et la résolution de problèmes techniques.
    Soyez concis, serviable, direct et professionnel. Répondez toujours en français par défaut, mais adaptez-vous si l'utilisateur change de langue.

    Voici les capacités spécifiques :
    - Assistance navigation : Fournir des directions ou indiquer les meilleures routes. (Pour l'instant, juste dire de consulter Google Maps).
    - Politiques de l'entreprise : Répondre aux questions sur les règles, paiements, etc.
    - Résolution de problèmes techniques courants : Dépannage basique de l'application ou du processus de livraison.
    - Optimisation des gains : Conseiller sur comment gagner plus.
    - Formation continue : Répondre aux questions sur les modules de formation.
    - Afficher les gains : Si l'utilisateur demande "Mes gains", utilisez la fonction Firestore pour récupérer les gains.
    - Afficher les prochaines livraisons : Si l'utilisateur demande "Mes livraisons" ou "Prochaines missions", utilisez la fonction Firestore.

    Si vous ne pouvez pas répondre à une question, indiquez que vous ne savez pas ou que vous allez transmettre au support humain si nécessaire.
  `;

  let botReply = "Bonjour chauffeur ! Comment puis-je vous assister ?";
  
  try {
    if (message.toLowerCase().includes("gains")) {
        const earnings = await getDriverEarnings(driverId);
        botReply = `Vos gains totaux jusqu'à présent sont de ${earnings.toLocaleString()} FCFA. Continuez comme ça !`;
    } else if (message.toLowerCase().includes("livraisons") || message.toLowerCase().includes("missions")) {
        const deliveries = await getDriverNextDeliveries(driverId);
        if (deliveries.length > 0) {
            botReply = "Voici vos prochaines livraisons : \n";
            deliveries.forEach(delivery => {
                botReply += `- Commande ${delivery.orderId} : ${delivery.description} à ${delivery.deliveryAddress} pour ${delivery.recipientName}. Statut : ${delivery.status}.\n`;
            });
        } else {
            botReply = "Vous n'avez pas de livraisons en cours ou à venir pour le moment.";
        }
    }
    else {
      // Utiliser OpenAI pour une réponse plus générale si aucune intention spécifique n'est détectée
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // ou gpt-4
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 150,
      });
      botReply = completion.choices[0].message?.content || "Désolé, je n'ai pas compris votre requête.";
    }

    res.status(200).json({ reply: botReply });

  } catch (error) {
    console.error("Error with OpenAI API or logic:", error);
    res.status(500).json({ message: 'Internal Server Error', error: (error as Error).message });
  }
}
