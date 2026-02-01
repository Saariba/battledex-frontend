
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Sparkles, SlidersHorizontal } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface SearchControlsProps {
  onSearch: (query: string, mode: 'semantic' | 'keyword') => void
  isLoading?: boolean
}

export function SearchControls({ onSearch, isLoading }: SearchControlsProps) {
  const [query, setQuery] = useState("")
  const [mode, setMode] = useState<'semantic' | 'keyword'>('semantic')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    onSearch(query, mode)
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-2 bg-secondary/30">
            <TabsTrigger value="semantic" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Semantic
            </TabsTrigger>
            <TabsTrigger value="keyword" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              <Search className="w-3.5 h-3.5 mr-2" />
              Keyword
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          {mode === 'semantic' ? <Sparkles className="w-5 h-5" /> : <Search className="w-5 h-5" />}
        </div>
        <Input
          placeholder={mode === 'semantic' ? "Search by meaning (e.g. 'bars about animal cage match')" : "Search exact keywords..."}
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
            {isLoading ? "Analyzing..." : "Find Bars"}
          </Button>
        </div>
      </form>
    </div>
  )
}
