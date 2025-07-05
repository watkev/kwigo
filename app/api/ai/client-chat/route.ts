// app/api/ai/client-chat/route.ts (Structure d'exemple)
import { NextResponse } from 'next/server';
// En supposant que vous utilisez OpenAI ou similaire. Ajustez les importations en fonction de votre SDK AI réel.
// import OpenAI from 'openai';
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Ou pour Google Gemini :
import { GoogleGenerativeAI } from '@google/generative-ai';


export async function POST(req: Request) {
  console.log("AI Chat API route appelée."); // Log 1 : Début de la route

  try {
    const { message, userId } = await req.json();
    console.log("Données reçues :", { message, userId }); // Log 2 : Données reçues

    // --- Vérifications cruciales ---
    if (!message) {
      console.error("Erreur : Le message est manquant.");
      return NextResponse.json({ error: "Le message est requis." }, { status: 400 });
    }
    if (!userId) {
      console.warn("Avertissement : userId est manquant (facultatif mais recommandé pour le contexte).");
      // Vous pourriez choisir de retourner un 400 si userId est obligatoire pour votre logique AI.
    }

    // 1. **Vérifiez l'existence de la clé API :**
    const geminiApiKey = process.env.GEMINI_API_KEY; // Assurez-vous que cela correspond au nom de votre variable dans .env.local
    if (!geminiApiKey) {
      console.error("La variable d'environnement GEMINI_API_KEY n'est pas définie."); // Log 3 : Clé API manquante
      return NextResponse.json({ message: "Clé API AI non configurée." }, { status: 500 });
    }
    console.log("Clé API AI trouvée."); // Log 4 : Clé API trouvée

    // Initialiser le modèle AI (ajustez en fonction de votre SDK, par exemple, OpenAI ou Gemini)
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log("Modèle AI initialisé."); // Log 5 : Modèle initialisé

    // 2. **Construction du prompt/charge utile de la requête :**
    // Assurez-vous que votre prompt est correctement formaté pour votre modèle AI.
    const prompt = `ID utilisateur : ${userId}\nMessage utilisateur : ${message}\n\nEn tant qu'assistant, répondez à l'utilisateur :`;
    console.log("Prompt envoyé à l'IA :", prompt); // Log 6 : Contenu du prompt

    // 3. **Effectuer l'appel API réel au service AI :**
    console.log("Envoi de la requête au service AI..."); // Log 7 : Avant l'appel AI
    const result = await model.generateContent(prompt);
    console.log("Résultat brut reçu du service AI :", result); // Log 8 : Après l'appel AI (brut)

    const response = await result.response;
    console.log("Objet de réponse AI reçu :", response); // Log 9 : Objet de réponse

    const text = response.text();
    console.log("Texte de réponse AI extrait :", text); // Log 10 : Texte extrait

    // 4. **Gestion de la réponse AI :**
    if (!text) {
      console.warn("La réponse de l'IA était vide."); // Log 11 : Réponse vide
      return NextResponse.json({ message: "L'IA a renvoyé une réponse vide." }, { status: 500 });
    }

    console.log("Réponse AI générée avec succès."); // Log 12 : Succès
    return NextResponse.json({ reply: text }, { status: 200 });

  } catch (error: any) {
    console.error("Erreur dans la route API de chat AI :", error); // Log 13 : Erreur générique
    if (error.response) { // Courant pour les erreurs HTTP des API externes
      console.error("Statut d'erreur de la réponse de l'API AI :", error.response.status);
      console.error("Données de la réponse de l'API AI :", error.response.data);
    } else if (error.message) {
      console.error("Message d'erreur :", error.message);
    }
    // Loggez l'objet d'erreur complet pour un maximum de détails pendant le débogage
    console.error("Objet d'erreur complet :", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));

    return NextResponse.json(
      { message: "Impossible d'obtenir une réponse de l'assistant AI", error: error.message || "Erreur inconnue" },
      { status: 500 }
    );
  }
}