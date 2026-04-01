"use client"

import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"

export function useShareCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  const shareAsImage = useCallback(async (shareText: string) => {
    if (!cardRef.current || isCapturing) return
    setIsCapturing(true)

    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#0a0a0a",
        useCORS: true,
        logging: false,
      })

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))),
          "image/png",
        )
      })

      const file = new File([blob], "battledex-result.png", { type: "image/png" })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ text: shareText, files: [file] })
        return
      }

      // Fallback: download image + copy text
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "battledex-result.png"
      a.click()
      URL.revokeObjectURL(url)

      await navigator.clipboard.writeText(shareText)
      toast.success("Bild heruntergeladen & Text kopiert!")
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return

      // Fall back to text-only sharing
      try {
        if (navigator.share) {
          await navigator.share({ text: shareText })
          return
        }
        await navigator.clipboard.writeText(shareText)
        toast.success("In die Zwischenablage kopiert!")
      } catch {
        toast.error("Teilen fehlgeschlagen")
      }
    } finally {
      setIsCapturing(false)
    }
  }, [isCapturing])

  return { cardRef, isCapturing, shareAsImage }
}
