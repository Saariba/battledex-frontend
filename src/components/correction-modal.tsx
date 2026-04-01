"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { SearchResult } from "@/lib/types"
import { correctionsService } from "@/lib/api/corrections"
import { ApiError } from "@/lib/api/types"

interface CorrectionModalProps {
  result: SearchResult | null
  onClose: () => void
}

export function CorrectionModal({ result, onClose }: CorrectionModalProps) {
  const [suggestedContent, setSuggestedContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset content when result changes
  useEffect(() => {
    if (result) {
      setSuggestedContent(result.line)
    }
  }, [result])

  if (!result) return null

  const handleSubmit = async () => {
    // Validate
    if (!suggestedContent.trim()) {
      toast.error("Bitte gib eine Korrektur ein")
      return
    }

    if (suggestedContent.trim() === result.line) {
      toast.error("Korrektur ist identisch mit dem Original")
      return
    }

    // Check if we have a line number (transcript_id)
    if (!result.line_number) {
      toast.error("Korrektur kann nicht gesendet werden: Zeilennummer fehlt")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await correctionsService.submitCorrection(
        result.line_number,
        suggestedContent.trim()
      )

      toast.success(response.message || "Correction submitted successfully!")
      onClose()
    } catch (error) {
      console.error("Correction submission error:", error)

      if (error instanceof ApiError) {
        toast.error(error.message)
      } else if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Korrektur konnte nicht gesendet werden")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={!!result} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-background border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-primary font-headline">
            Lyric-Korrektur einreichen
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Hilf mit, die Datenbank zu verbessern, indem du eine Korrektur für diese Zeile vorschlägst.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
              Original-Zeile
            </label>
            <div className="bg-card/50 border border-border/30 rounded-lg p-4">
              <p className="text-foreground italic">"{result.line}"</p>
              <p className="text-xs text-muted-foreground mt-2">
                — {result.rapper.name} in {result.battle.title}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
              Deine Korrektur
            </label>
            <Textarea
              value={suggestedContent}
              onChange={(e) => setSuggestedContent(e.target.value)}
              placeholder="Korrigierten Text eingeben..."
              className="min-h-24 bg-background border-border/50 focus:border-primary"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Bitte auf Richtigkeit achten. Deine Korrektur wird geprüft, bevor sie übernommen wird.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? "Wird gesendet..." : "Korrektur absenden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
