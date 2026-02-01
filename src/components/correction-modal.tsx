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
      toast.error("Please enter a correction")
      return
    }

    if (suggestedContent.trim() === result.line) {
      toast.error("Correction is the same as the original")
      return
    }

    // Check if we have a line number (transcript_id)
    if (!result.line_number) {
      toast.error("Cannot submit correction: missing line number")
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
        toast.error("Failed to submit correction")
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
            Submit Lyric Correction
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Help improve the accuracy of the database by suggesting a correction for this line.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
              Original Line
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
              Your Correction
            </label>
            <Textarea
              value={suggestedContent}
              onChange={(e) => setSuggestedContent(e.target.value)}
              placeholder="Enter the corrected lyric..."
              className="min-h-24 bg-background border-border/50 focus:border-primary"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Please ensure accuracy. Your correction will be reviewed before being applied.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? "Submitting..." : "Submit Correction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
