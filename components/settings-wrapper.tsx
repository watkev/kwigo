"use client"

import type React from "react"
import { SettingsProvider } from "./settings-context"

interface SettingsWrapperProps {
  children: React.ReactNode
}

export function SettingsWrapper({ children }: SettingsWrapperProps) {
  return <SettingsProvider>{children}</SettingsProvider>
}
