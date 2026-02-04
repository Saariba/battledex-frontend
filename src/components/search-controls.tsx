
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface SearchControlsProps {
  onSearch: (query: string, mode: 'semantic' | 'keyword') => void
  isLoading?: boolean
  value?: string
  onValueChange?: (value: string) => void
}

export function SearchControls({ onSearch, isLoading, value, onValueChange }: SearchControlsProps) {
  const [internalQuery, setInternalQuery] = useState("")

  // Use controlled value if provided, otherwise use internal state
  const query = value !== undefined ? value : internalQuery
  const setQuery = onValueChange || setInternalQuery

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    // Always use semantic search since backend returns both types
    onSearch(query, 'semantic')
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search className="w-5 h-5" />
        </div>
        <Input
          placeholder="Search for punchlines (e.g. 'bars about boxing' or 'chess metaphors')"
          className="pl-12 h-14 bg-card/60 border-border/50 text-lg rounded-2xl focus:ring-primary focus:border-primary transition-all duration-300 shadow-lg"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute inset-y-2 right-2 flex items-center">
          <Button
            type="submit"
            className="h-full px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? "Searching..." : "Find Bars"}
          </Button>
        </div>
      </form>
    </div>
  )
}
