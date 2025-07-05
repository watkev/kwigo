// app/driver/ai-assistant/page.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Car } from "lucide-react"; // Utiliser l'icône Car pour le chauffeur
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
}

export default function DriverAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = { id: Date.now().toString(), sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Send message to your Next.js API route for drivers
      const response = await fetch("/api/ai/driver-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input, userRole: "driver" }), // Passer le rôle du chauffeur
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI assistant");
      }

      const data = await response.json();
      const botMessage: Message = { id: Date.now().toString(), sender: "bot", text: data.reply };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erreur IA",
        description: "Une erreur est survenue lors de la communication avec l'assistant.",
        variant: "destructive",
      });
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          sender: "bot",
          text: "Désolé, je rencontre des difficultés pour le moment. Veuillez réessayer plus tard.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto h-[80vh] flex flex-col shadow-xl rounded-lg border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-3 bg-card border-b border-border rounded-t-lg px-6 py-4">
          <CardTitle className="text-2xl font-bold flex items-center text-foreground">
            <Car className="w-7 h-7 mr-3 text-primary" /> {/* Icône de voiture pour le chauffeur */}
            Assistant IA Chauffeur
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col p-6 bg-background">
          <ScrollArea className="flex-grow pr-4 mb-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Car className="w-16 h-16 mb-6 text-primary opacity-70 animate-bounce-slow" /> {/* Icône de voiture plus grande et animée */}
                <p className="text-xl font-semibold mb-2">Bonjour chauffeur ! Comment puis-je vous assister aujourd'hui ?</p>
                <p className="text-md max-w-sm">Essayez : "Mes prochaines livraisons" ou "Comment optimiser mes gains?"</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] p-3 rounded-lg shadow-sm ${
                        msg.sender === "user"
                          ? "bg-primary text-primary-foreground rounded-br-none" // Coins arrondis sauf en bas à droite
                          : "bg-secondary text-secondary-foreground rounded-bl-none" // Coins arrondis sauf en bas à gauche
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>
          <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border">
            <Input
              placeholder="Écrivez votre message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={loading}
              className="flex-grow h-12 rounded-full px-5 border-border focus-visible:ring-primary focus-visible:ring-offset-background"
            />
            <Button
              onClick={sendMessage}
              disabled={loading || input.trim() === ""}
              className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-transform transform hover:scale-105"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-foreground"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
