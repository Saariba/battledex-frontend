"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Check, ChevronsUpDown, X, Mic } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { rappersService } from "@/lib/api/rappers"

interface RapperMultiSelectProps {
  selected: string[]
  onChange: (names: string[]) => void
  max?: number
  placeholder?: string
  className?: string
}

export function RapperMultiSelect({
  selected,
  onChange,
  max = 8,
  placeholder = "Rapper filtern...",
  className,
}: RapperMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [rappers, setRappers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const hasFetched = useRef(false)

  // Fetch all rappers (paginated)
  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    setLoading(true)

    async function fetchAll() {
      const allNames: string[] = []
      let offset = 0
      const pageSize = 1000
      while (true) {
        const res = await rappersService.listRappers(pageSize, offset)
        allNames.push(...res.rappers.map((r) => r.name))
        if (allNames.length >= res.total || res.rappers.length < pageSize) break
        offset += pageSize
      }
      return allNames
    }

    fetchAll()
      .then(setRappers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = search
    ? rappers.filter((r) =>
        r.toLowerCase().includes(search.toLowerCase())
      )
    : rappers

  const toggle = useCallback(
    (name: string) => {
      if (selected.includes(name)) {
        onChange(selected.filter((s) => s !== name))
      } else if (selected.length < max) {
        onChange([...selected, name])
      }
    },
    [selected, onChange, max]
  )

  const remove = useCallback(
    (name: string) => {
      onChange(selected.filter((s) => s !== name))
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
            <span className="flex items-center gap-2 text-muted-foreground">
              <Mic className="h-3.5 w-3.5" />
              {selected.length > 0
                ? `${selected.length} Rapper`
                : placeholder}
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
                const isSelected = selected.includes(name)
                const isDisabled = !isSelected && selected.length >= max
                return (
                  <button
                    key={name}
                    onClick={() => !isDisabled && toggle(name)}
                    disabled={isDisabled}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent/10",
                      isDisabled && "opacity-40 cursor-not-allowed"
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

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((name) => (
            <Badge
              key={name}
              variant="secondary"
              className="gap-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
            >
              {name}
              <button
                onClick={() => remove(name)}
                className="ml-0.5 rounded-full hover:bg-primary/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
