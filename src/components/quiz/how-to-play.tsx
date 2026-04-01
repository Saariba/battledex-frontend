"use client"

import { useEffect, useState } from "react"
import { HelpCircle, Brain, Flame, Target, Lightbulb, Trophy, CircleOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export function HowToPlay() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem("battledex_how_to_play_seen")
    if (!seen) {
      setOpen(true)
      localStorage.setItem("battledex_how_to_play_seen", "1")
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="rounded-full text-muted-foreground hover:text-foreground"
        aria-label="Spielregeln anzeigen"
      >
        <HelpCircle className="h-5 w-5" />
      </Button>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight">
            Spielregeln
          </DialogTitle>
          <DialogDescription>
            So funktioniert das BattleDex Quiz
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold">Tägliches Quiz</h3>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                <p>Du siehst eine Line aus einem Battle-Rap und musst erraten, von welchem Rapper sie stammt.</p>
              </div>
              <div className="flex gap-3">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                <p>Du hast <span className="font-semibold text-foreground">5 Versuche</span>. Nach jedem Fehlversuch wird ein neuer Hinweis freigeschaltet.</p>
              </div>
              <div className="flex gap-3">
                <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/70" />
                <p>Hinweise: Jahr → Line davor → Gegner → Line danach</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-border/40" />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold">Tägliche Challenge</h3>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                <p>Mehrere Lines hintereinander — errate so viele Rapper wie möglich.</p>
              </div>
              <div className="flex gap-3">
                <CircleOff className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                <p><span className="font-semibold text-foreground">5 Fehlversuche</span> bei einer Line beenden den gesamten Run.</p>
              </div>
              <div className="flex gap-3">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                <p>Bei jeder richtig erratenen Line geht es weiter zur nächsten. Hinweise funktionieren wie beim Quiz.</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-border/40" />

          <p className="text-center text-xs text-muted-foreground">
            Jeden Tag gibt es neue Lines — für alle Spieler die gleichen.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
