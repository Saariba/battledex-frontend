'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { rappersService, type RapperProfile, type RapperBattle } from '@/lib/api/rappers'
import { extractYouTubeId } from '@/lib/api/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mic2, Play, Swords, FileText, Search, ArrowLeft, ScrollText, CalendarDays, Eye } from 'lucide-react'
import { toast } from 'sonner'

export default function RapperProfilePage() {
  const params = useParams()
  const rapperName = decodeURIComponent(params.name as string)
  const [profile, setProfile] = useState<RapperProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [sortValue, setSortValue] = useState('date_desc')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || !rapperName) return
    loadProfile()
  }, [isMounted, rapperName])

  useEffect(() => {
    if (profile) {
      document.title = `${profile.name} - BattleDex`
    }
    return () => { document.title = 'BattleDex' }
  }, [profile])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const data = await rappersService.getProfile(rapperName)
      setProfile(data)
    } catch (error) {
      console.error('Failed to load rapper profile:', error)
      toast.error('Rapper-Profil konnte nicht geladen werden')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted) return null

  const avgLinesPerBattle = profile && profile.totalBattles > 0
    ? Math.round(profile.totalLines / profile.totalBattles)
    : 0

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Zurück zur Suche
        </Link>

        {isLoading ? (
          <RapperProfileSkeleton />
        ) : profile ? (
          <>
            {/* Profile Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-2xl">
                  <Mic2 className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight">
                    {profile.name}
                  </h1>
                  {profile.aliases.length > 0 && (
                    <p className="text-muted-foreground mt-1">
                      aka {profile.aliases.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-xl">
                    <Swords className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-black font-headline text-primary">
                      {profile.totalBattles}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Battles</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="bg-green-500/10 p-3 rounded-xl">
                    <FileText className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-black font-headline text-green-500">
                      {profile.totalLines.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Zeilen</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="bg-purple-500/10 p-3 rounded-xl">
                    <FileText className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-black font-headline text-purple-500">
                      ~{avgLinesPerBattle}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Zeilen / Battle</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="bg-red-500/10 p-3 rounded-xl">
                    <Eye className="w-6 h-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-black font-headline text-red-500">
                      {profile.totalYoutubeViews >= 1_000_000
                        ? `${(profile.totalYoutubeViews / 1_000_000).toFixed(1)}M`
                        : profile.totalYoutubeViews >= 1_000
                          ? `${(profile.totalYoutubeViews / 1_000).toFixed(0)}K`
                          : profile.totalYoutubeViews.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Views gesamt</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="bg-orange-500/10 p-3 rounded-xl">
                    <Eye className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-black font-headline text-orange-500">
                      {profile.avgYoutubeViews >= 1_000_000
                        ? `${(profile.avgYoutubeViews / 1_000_000).toFixed(1)}M`
                        : profile.avgYoutubeViews >= 1_000
                          ? `${(profile.avgYoutubeViews / 1_000).toFixed(0)}K`
                          : profile.avgYoutubeViews.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Ø Views / Battle</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Battles List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                  <span className="text-primary">#</span>
                  Battle-Verlauf
                  <span className="text-sm font-normal text-muted-foreground">
                    ({profile.battles.length})
                  </span>
                </h2>
                {profile.battles.length > 1 && (
                  <Select value={sortValue} onValueChange={setSortValue}>
                    <SelectTrigger className="w-[200px] bg-card/60 border-border/50">
                      <SelectValue placeholder="Sortierung" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date_desc">Neueste zuerst</SelectItem>
                      <SelectItem value="date_asc">Älteste zuerst</SelectItem>
                      <SelectItem value="views_desc">Meiste Views</SelectItem>
                      <SelectItem value="views_asc">Wenigste Views</SelectItem>
                      <SelectItem value="title_asc">Titel A-Z</SelectItem>
                      <SelectItem value="title_desc">Titel Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              {profile.battles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...profile.battles].sort((a, b) => {
                    switch (sortValue) {
                      case 'date_asc':
                        return (a.uploadDate || a.date || '').localeCompare(b.uploadDate || b.date || '')
                      case 'date_desc':
                        return (b.uploadDate || b.date || '').localeCompare(a.uploadDate || a.date || '')
                      case 'views_desc':
                        return (b.youtubeViews ?? 0) - (a.youtubeViews ?? 0)
                      case 'views_asc':
                        return (a.youtubeViews ?? 0) - (b.youtubeViews ?? 0)
                      case 'title_asc':
                        return a.title.localeCompare(b.title)
                      case 'title_desc':
                        return b.title.localeCompare(a.title)
                      default:
                        return 0
                    }
                  }).map(battle => (
                    <RapperBattleCard key={battle.id} battle={battle} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card/20 rounded-3xl border border-dashed border-border/40">
                  <Swords className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Keine Battles für diesen Rapper gefunden.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-24 bg-card/20 rounded-3xl border border-dashed border-border/40">
            <Mic2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-muted-foreground">Rapper nicht gefunden</h3>
            <p className="text-muted-foreground mt-2">
              Kein Profil für &ldquo;{rapperName}&rdquo; gefunden
            </p>
            <Link href="/" className="mt-6 inline-block">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Zurück zur Suche
              </Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

function RapperProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Skeleton className="w-[72px] h-[72px] rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <Card key={i} className="border-border/20 bg-card/30">
            <CardContent className="p-5 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-border/20 bg-card/30">
              <Skeleton className="aspect-video w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function RapperBattleCard({ battle }: { battle: RapperBattle }) {
  const videoId = battle.videoUrl ? extractYouTubeId(battle.videoUrl) : null
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null

  return (
    <Card className="overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 group shadow-md">
      <CardHeader className="p-0">
        {battle.videoUrl ? (
          <a
            href={battle.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative aspect-video bg-gradient-to-br from-card to-background overflow-hidden cursor-pointer"
          >
            {thumbnailUrl ? (
              <Image
                src={thumbnailUrl}
                alt={battle.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Swords className="w-12 h-12 text-muted-foreground/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <Play className="w-16 h-16 text-white drop-shadow-lg" />
            </div>
          </a>
        ) : (
          <div className="relative aspect-video bg-gradient-to-br from-card to-background overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <Swords className="w-12 h-12 text-muted-foreground/20" />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          {battle.uploadDate && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="w-3 h-3" />
              {new Date(battle.uploadDate + 'T00:00:00').toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
          {battle.lineCount > 0 && (
            <Badge variant="outline" className="text-[10px] font-code border-green-500/30 text-green-500">
              <ScrollText className="w-3 h-3 mr-1" />
              {battle.lineCount} Zeilen
            </Badge>
          )}
          {battle.youtubeViews != null && (
            <Badge variant="outline" className="text-[10px] font-code border-red-500/30 text-red-500">
              <Eye className="w-3 h-3 mr-1" />
              {battle.youtubeViews.toLocaleString('de-DE')} Views
            </Badge>
          )}
        </div>
        <Link href={`/battles/${battle.id}`}>
          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
            {battle.title}
          </h3>
        </Link>
        {battle.opponentNames.length > 0 && (
          <p className="text-sm text-muted-foreground">
            vs.{' '}
            {battle.opponentNames.map((name, i) => (
              <React.Fragment key={name}>
                {i > 0 && ', '}
                <Link
                  href={`/rappers/${encodeURIComponent(name)}`}
                  className="text-primary/80 hover:text-primary hover:underline transition-colors"
                >
                  {name}
                </Link>
              </React.Fragment>
            ))}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2">
        <Link href={`/battles/${battle.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <FileText className="w-4 h-4 mr-2" />
            Details ansehen
          </Button>
        </Link>
        {battle.videoUrl && (
          <a href={battle.videoUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
            >
              <Play className="w-4 h-4 mr-2" />
              YouTube
            </Button>
          </a>
        )}
      </CardFooter>
    </Card>
  )
}
