"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { User, Settings, Bell, MapPin, CreditCard, Shield, Car, FileText, Clock } from "lucide-react"

interface SettingsNavigationProps {
  userRole: "client" | "driver" | "admin"
}

export function SettingsNavigation({ userRole }: SettingsNavigationProps) {
  const pathname = usePathname()

  const clientLinks = [
    { href: `/${userRole}/profile`, label: "Profil", icon: User },
    { href: `/${userRole}/settings`, label: "Paramètres généraux", icon: Settings },
    { href: `/${userRole}/settings/notifications`, label: "Notifications", icon: Bell },
    { href: `/${userRole}/settings/addresses`, label: "Adresses", icon: MapPin },
    { href: `/${userRole}/settings/payments`, label: "Paiements", icon: CreditCard },
    { href: `/${userRole}/settings/security`, label: "Sécurité", icon: Shield },
  ]

  const driverLinks = [
    { href: `/${userRole}/profile`, label: "Profil", icon: User },
    { href: `/${userRole}/settings`, label: "Paramètres généraux", icon: Settings },
    { href: `/${userRole}/settings/vehicle`, label: "Véhicule", icon: Car },
    { href: `/${userRole}/settings/documents`, label: "Documents", icon: FileText },
    { href: `/${userRole}/settings/work`, label: "Préférences travail", icon: Clock },
    { href: `/${userRole}/settings/notifications`, label: "Notifications", icon: Bell },
    { href: `/${userRole}/settings/security`, label: "Sécurité", icon: Shield },
  ]

  const links = userRole === "driver" ? driverLinks : clientLinks

  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const Icon = link.icon
        const isActive = pathname === link.href

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
