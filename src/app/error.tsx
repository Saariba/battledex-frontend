"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="mx-auto max-w-lg rounded-3xl border border-border/40 bg-card/35 p-10 text-center backdrop-blur-md">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-secondary/20">
          <AlertTriangle className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight">
          Etwas ist schiefgelaufen
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.
        </p>
        <Button onClick={reset} className="mt-8 rounded-full" size="lg">
          Erneut versuchen
        </Button>
      </div>
    </main>
  )
}
