import Link from "next/link"
import { Swords } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="mx-auto max-w-lg rounded-3xl border border-border/40 bg-card/35 p-10 text-center backdrop-blur-md">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-secondary/20">
          <Swords className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight">404</h1>
        <p className="mt-2 text-lg font-semibold text-muted-foreground">
          Seite nicht gefunden
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <Button asChild className="mt-8 rounded-full" size="lg">
          <Link href="/">Zur Startseite</Link>
        </Button>
      </div>
    </main>
  )
}
