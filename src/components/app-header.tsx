"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Swords, Users, Brain, Type } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/quiz", label: "Quiz", icon: Brain },
  { href: "/battles", label: "Battles", icon: Swords },
  { href: "/rappers", label: "Rapper", icon: Users },
  { href: "/word-stats", label: "Wort-Stats", icon: Type },
]

export function AppHeader() {
  const pathname = usePathname()

  return (
    <header className="h-14 md:h-20 flex items-center justify-between px-3 md:px-10 border-b border-border/20 backdrop-blur-md sticky top-0 z-20 bg-background/80">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Image
            src="/battledex-logo.png"
            alt="BattleDex"
            width={48}
            height={48}
            className="h-9 md:h-12 w-auto object-contain cursor-pointer"
          />
        </Link>
      </div>
      <nav className="flex items-center gap-1 md:gap-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold transition-colors rounded-lg",
              pathname === href
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        ))}
      </nav>
    </header>
  )
}
