"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, Sidebar, SidebarHeader, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { SearchControls } from "@/components/search-controls"
import { PunchlineCard } from "@/components/punchline-card"
import { VideoModal } from "@/components/video-modal"
import { SidebarFilters } from "@/components/sidebar-filters"
import { SearchResult, Rapper, Battle } from "@/lib/types"
import { MOCK_RAPPERS, MOCK_BATTLES, MOCK_RESULTS } from "@/lib/mock-data"
import { Flame, Trophy, History, Layers, Search } from "lucide-react"

export default function RapBattleApp() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedVideo, setSelectedVideo] = useState<SearchResult | null>(null)
  const [rappers, setRappers] = useState<Rapper[]>([])
  const [battles, setBattles] = useState<Battle[]>([])
  const [selectedRapper, setSelectedRapper] = useState<string | undefined>()
  const [selectedBattle, setSelectedBattle] = useState<string | undefined>()

  useEffect(() => {
    // Initial data load
    setRappers(MOCK_RAPPERS)
    setBattles(MOCK_BATTLES)
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
      const matchesRapper = !selectedRapper || r.rapperId === selectedRapper
      const matchesBattle = !selectedBattle || r.battleId === selectedBattle
      return matchesSearch && matchesRapper && matchesBattle
    })
    
    setResults(filtered)
    setIsLoading(false)
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-body">
        <Sidebar className="border-r border-border/40">
          <SidebarHeader className="p-6 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg shadow-lg shadow-primary/20">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-black font-headline tracking-tighter text-white">BATTLE<span className="text-primary italic">LINES</span></h1>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Punchline Engine</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarFilters 
            rappers={rappers}
            battles={battles}
            selectedRapperId={selectedRapper}
            onSelectRapper={(id) => setSelectedRapper(id === selectedRapper ? undefined : id)}
            selectedBattleId={selectedBattle}
            onSelectBattle={(id) => setSelectedBattle(id === selectedBattle ? undefined : id)}
          />
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
          <header className="h-16 flex items-center px-6 border-b border-border/20 backdrop-blur-md sticky top-0 z-20">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-6">
              <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-muted-foreground">
                <a href="#" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <Trophy className="w-4 h-4" /> Rankings
                </a>
                <a href="#" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <History className="w-4 h-4" /> Recent
                </a>
                <a href="#" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                  <Layers className="w-4 h-4" /> Collections
                </a>
              </nav>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-5xl mx-auto space-y-12">
              <section className="text-center space-y-4">
                <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tight max-w-3xl mx-auto leading-none">
                  SEARCH FOR THE <span className="text-primary underline decoration-primary/30 underline-offset-8">HARDESBARS</span> IN BATTLE RAP
                </h2>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                  Find punchlines by meaning, rapper, or league using our semantic neural search engine.
                </p>
                <div className="pt-6">
                  <SearchControls onSearch={handleSearch} isLoading={isLoading} />
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <h3 className="text-xl font-bold font-headline flex items-center gap-2">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-64 rounded-xl bg-card/50 animate-pulse border border-border/20" />
                    ))}
                  </div>
                ) : results.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {results.map((result) => (
                      <PunchlineCard 
                        key={result.id} 
                        result={result} 
                        onPlayVideo={setSelectedVideo}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-card/20 rounded-3xl border border-dashed border-border/40">
                    <div className="bg-secondary/20 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <Search className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-muted-foreground">No bars matched your search.</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                      Try searching for broader terms like "boxing" or "animal" or clear your filters.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </main>
        </SidebarInset>

        <VideoModal result={selectedVideo} onClose={() => setSelectedVideo(null)} />
      </div>
    </SidebarProvider>
  )
}
