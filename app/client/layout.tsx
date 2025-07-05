// app/layout.tsx (Votre Root Layout)
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider"; // Si vous utilisez un ThemeProvider
// Update the import path if the providers folder is outside 'client', e.g. '../providers/auth-provider'
import { AuthProvider } from "../providers/auth-provider"; // <-- Importez AuthProvider ici
import { Toaster } from "@/components/ui/toaster"; // Si vous utilisez un Toaster

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kwigo - Livraison Express",
  description: "Simplifiez vos livraisons avec Kwigo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider> {/* <-- Enveloppez toute l'application avec AuthProvider */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children} {/* Tous vos layouts et pages, y compris ClientLayout, seront rendus ici */}
            <Toaster /> {/* Votre Toaster, si utilisé */}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}