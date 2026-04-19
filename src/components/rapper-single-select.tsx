"use client"

import { useState, useRef, useCallback } from "react"
import { Check, ChevronsUpDown, Mic } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface RapperSingleSelectProps {
  rappers: string[]
  loading: boolean
  selected: string | null
  onChange: (name: string | null) => void
  exclude?: string
  placeholder?: string
  className?: string
}

export function RapperSingleSelect({
  rappers,
  loading,
  selected,
  onChange,
  exclude,
  placeholder = "Rapper wählen...",
  className,
}: RapperSingleSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = search
    ? rappers.filter((r) => r.toLowerCase().includes(search.toLowerCase()))
    : rappers

  const toggle = useCallback(
    (name: string) => {
      if (selected === name) {
        onChange(null)
      } else {
        onChange(name)
      }
      setOpen(false)
    },
    [selected, onChange]
  )

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            role="combobox"
            aria-expanded={open}
            className="flex h-10 w-full items-center justify-between rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-sm transition-colors hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <span className="flex items-center gap-2 truncate">
              <Mic className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              {selected ? (
                <span className="font-medium truncate">{selected}</span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <div className="p-2">
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Suchen..."
              className="w-full rounded-md border border-border/40 bg-background px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/40"
            />
          </div>
          <div className="max-h-56 overflow-y-auto px-1 pb-1">
            {loading ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Wird geladen...
              </p>
            ) : filtered.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Keine Rapper gefunden
              </p>
            ) : (
              filtered.map((name) => {
                const isSelected = selected === name
                const isExcluded = exclude === name
                return (
                  <button
                    key={name}
                    onClick={() => !isExcluded && toggle(name)}
                    disabled={isExcluded}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent/10",
                      isExcluded && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border/60"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    {name}
                  </button>
                )
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
