"use client"

import { useState, useEffect } from "react"
import { SearchControls } from "@/components/search-controls"
import { PunchlineCard } from "@/components/punchline-card"
import { VideoModal } from "@/components/video-modal"
import { SearchResult } from "@/lib/types"
import { MOCK_RESULTS } from "@/lib/mock-data"
import { Flame, Search } from "lucide-react"

export default function RapBattleApp() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedVideo, setSelectedVideo] = useState<SearchResult | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setResults(MOCK_RESULTS)
  }, [])

  const handleSearch = async (query: string, mode: 'semantic' | 'keyword') => {
    setIsLoading(true)
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    // In a real app, this would call the AI flows
    const filtered = MOCK_RESULTS.filter(r => {
      const matchesSearch = r.line.toLowerCase().includes(query.toLowerCase()) || 
                           r.context.some(c => c.toLowerCase().includes(query.toLowerCase()))
      return matchesSearch
    })
    
    setResults(filtered)
    setIsLoading(false)
  }

  if (!isMounted) return null

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <header className="h-20 flex items-center px-6 md:px-10 border-b border-border/20 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg shadow-lg shadow-primary/20">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black font-headline tracking-tighter text-white">BATTLE<span className="text-primary italic">LINES</span></h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Punchline Engine</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-5xl mx-auto space-y-12">
          <section className="text-center space-y-6 py-10">
            <h2 className="text-5xl md:text-7xl font-black font-headline tracking-tight max-w-4xl mx-auto leading-none">
              SEARCH FOR THE <span className="text-primary underline decoration-primary/30 underline-offset-8">HARDEST BARS</span> IN BATTLE RAP
            </h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Find punchlines by meaning, rapper, or league using our semantic neural search engine.
            </p>
            <div className="pt-6">
              <SearchControls onSearch={handleSearch} isLoading={isLoading} />
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <h3 className="text-2xl font-bold font-headline flex items-center gap-2">
                <span className="text-primary">#</span> 
                {results.length} Results Found
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Sort by:</span>
                <select className="bg-transparent text-xs font-bold focus:outline-none text-primary cursor-pointer">
                  <option>Relevance</option>
                  <option>Impact</option>
                  <option>Recent</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-50">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-64 rounded-2xl bg-card/50 animate-pulse border border-border/20" />
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {results.map((result) => (
                  <PunchlineCard 
                    key={result.id} 
                    result={result} 
                    onPlayVideo={setSelectedVideo}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-card/20 rounded-3xl border border-dashed border-border/40 backdrop-blur-sm">
                <div className="bg-secondary/20 p-8 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-muted-foreground">No bars matched your search.</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-3">
                  Try searching for broader terms like "boxing" or "animal" or check your spelling.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="p-8 text-center border-t border-border/20 text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]">
        BattleLines AI • Semantic Neural Punchline Search
      </footer>

      <VideoModal result={selectedVideo} onClose={() => setSelectedVideo(null)} />
    </div>
  )
}
