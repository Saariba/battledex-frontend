'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface RapperCount {
  name: string
  count: number
}

interface RapperFilterDropdownProps {
  rappers: RapperCount[]
  selectedRapper: string | null
  onSelect: (rapper: string) => void
}

export function RapperFilterDropdown({
  rappers,
  selectedRapper,
  onSelect,
}: RapperFilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Filter rappers based on search
  const filteredRappers = rappers.filter(rapper =>
    rapper.name.toLowerCase().includes(search.toLowerCase())
  )

  // Sort by count descending
  const sortedRappers = filteredRappers.sort((a, b) => b.count - a.count)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedRapper && rappers.find(r => r.name === selectedRapper)
            ? selectedRapper
            : "Weitere Rapper..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <div className="p-2">
          <Input
            placeholder="Rapper suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {sortedRappers.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Keine Rapper gefunden
            </div>
          ) : (
            sortedRappers.map((rapper) => (
              <button
                key={rapper.name}
                onClick={() => {
                  onSelect(rapper.name)
                  setOpen(false)
                  setSearch('')
                }}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center justify-between",
                  selectedRapper === rapper.name && "bg-accent"
                )}
              >
                <span className="flex-1 truncate" title={rapper.name}>{rapper.name}</span>
                {selectedRapper === rapper.name && (
                  <Check className="ml-2 h-4 w-4 shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
