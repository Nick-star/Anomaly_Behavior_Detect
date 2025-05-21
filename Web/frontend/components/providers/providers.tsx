"use client"

import { SessionProvider } from "next-auth/react"
import { ContextMenuProvider } from "@/components/providers/context_menu"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ContextMenuProvider>
        {children}
      </ContextMenuProvider>
    </SessionProvider>
  )
}