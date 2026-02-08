"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Swords, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/battles", label: "Browse Battles", icon: Swords },
  { href: "/stats", label: "DB Stats", icon: BarChart3 },
]

export function AppHeader() {
  const pathname = usePathname()

  return (
    <header className="h-20 flex items-center justify-between px-6 md:px-10 border-b border-border/20 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <Link href="/">
          <img
            src="/battledex-logo.png"
            alt="BattleDex"
            className="h-12 w-auto object-contain cursor-pointer"
          />
        </Link>
      </div>
      <nav className="flex items-center gap-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors",
              pathname === href
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
