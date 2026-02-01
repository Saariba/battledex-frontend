
"use client"

import { Rapper, Battle } from "@/lib/types"
import { 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem 
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mic2, Film, Radio } from "lucide-react"

interface SidebarFiltersProps {
  rappers: Rapper[]
  battles: Battle[]
  selectedRapperId?: string
  onSelectRapper: (id: string) => void
  selectedBattleId?: string
  onSelectBattle: (id: string) => void
}

export function SidebarFilters({ 
  rappers, 
  battles, 
  selectedRapperId, 
  onSelectRapper,
  selectedBattleId,
  onSelectBattle
}: SidebarFiltersProps) {
  return (
    <SidebarContent className="bg-sidebar">
      <SidebarGroup>
        <SidebarGroupLabel className="text-primary font-bold tracking-widest uppercase text-[10px]">
          Top Emcees
        </SidebarGroupLabel>
        <SidebarMenu>
          {rappers.map((rapper) => (
            <SidebarMenuItem key={rapper.id}>
              <SidebarMenuButton 
                isActive={selectedRapperId === rapper.id}
                onClick={() => onSelectRapper(rapper.id)}
                className="py-6"
              >
                <Avatar className="h-8 w-8 mr-2 border border-border">
                  <AvatarImage src={rapper.avatarUrl} />
                  <AvatarFallback className="bg-secondary text-[10px]"><Mic2 className="w-4 h-4" /></AvatarFallback>
                </Avatar>
                <span className="font-semibold">{rapper.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel className="text-primary font-bold tracking-widest uppercase text-[10px]">
          Iconic Battles
        </SidebarGroupLabel>
        <SidebarMenu>
          {battles.map((battle) => (
            <SidebarMenuItem key={battle.id}>
              <SidebarMenuButton 
                isActive={selectedBattleId === battle.id}
                onClick={() => onSelectBattle(battle.id)}
                className="py-4 h-auto flex-col items-start gap-1"
              >
                <div className="flex items-center gap-2">
                  <Film className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium line-clamp-1">{battle.title}</span>
                </div>
                <div className="flex items-center gap-1 opacity-60">
                   <Radio className="w-3 h-3" />
                   <span className="text-[10px]">{battle.league}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
  )
}
