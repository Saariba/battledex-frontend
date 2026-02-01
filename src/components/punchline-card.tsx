
"use client"

import { SearchResult } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, ChevronDown, ChevronUp, Mic2, Swords } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface PunchlineCardProps {
  result: SearchResult
  onPlayVideo: (result: SearchResult) => void
}

export function PunchlineCard({ result, onPlayVideo }: PunchlineCardProps) {
  const [showContext, setShowContext] = useState(false)

  return (
    <Card className="card-hover-effect overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-code border-primary/30 text-primary">
              <Swords className="w-3 h-3 mr-1" />
              {result.battle.league}
            </Badge>
            {result.score && (
              <Badge variant="secondary" className="text-[10px] bg-secondary/50">
                Match: {(result.score * 100).toFixed(0)}%
              </Badge>
            )}
          </div>
          <span className="font-code text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded border border-border/30">
            T-{Math.floor(result.timestamp / 60)}:{(result.timestamp % 60).toString().padStart(2, '0')}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-muted-foreground truncate">{result.battle.title}</h3>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="relative pl-4 border-l-2 border-primary mb-4">
          <p className="text-xl font-bold font-headline leading-tight tracking-tight text-foreground text-glow italic">
            "{result.line}"
          </p>
          <div className="absolute -left-2 top-0 bg-primary text-primary-foreground p-0.5 rounded-full">
            <Mic2 className="w-3 h-3" />
          </div>
        </div>

        {showContext && (
          <div className="space-y-2 mb-4 animate-in slide-in-from-top-2 duration-300">
            {result.context.map((line, idx) => (
              <p 
                key={idx} 
                className={cn(
                  "text-sm font-code leading-relaxed",
                  line === result.line ? "text-foreground font-bold" : "text-muted-foreground opacity-60"
                )}
              >
                <span className="mr-3 opacity-30 select-none">{idx + 1}</span>
                {line}
              </p>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between gap-3 border-t border-border/20 mt-2 bg-black/20">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowContext(!showContext)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {showContext ? (
            <>Hide Context <ChevronUp className="ml-1 w-3 h-3" /></>
          ) : (
            <>View Context <ChevronDown className="ml-1 w-3 h-3" /></>
          )}
        </Button>
        <Button 
          size="sm" 
          className="bg-accent hover:bg-accent/80 text-white font-semibold transition-all hover:scale-105"
          onClick={() => onPlayVideo(result)}
        >
          <Play className="mr-1.5 w-3.5 h-3.5 fill-current" />
          Watch Line
        </Button>
      </CardFooter>
    </Card>
  )
}
