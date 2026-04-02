import type {Metadata} from 'next';
import Link from 'next/link';
import { Toaster } from 'sonner';
import { AppHeader } from '@/components/app-header';
import './globals.css';

export const metadata: Metadata = {
  title: 'BattleDex | Punchline-Datenbank',
  description: 'Durchsuche Punchlines aus deutschem Battlerap nach Bedeutung, Kontext und Stil.',
  openGraph: {
    type: 'website',
    siteName: 'BattleDex',
    locale: 'de_DE',
    description: 'Die Punchline-Datenbank für deutschen Battlerap. Durchsuche tausende Lines nach Bedeutung, Kontext und Stil.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&family=Roboto+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
        <script
          defer
          src="https://battledex.de/umami/script.js"
          data-website-id="93ec9c24-8708-449e-8ab3-965f38349d7e"
        />
      </head>
      <body className="font-body antialiased bg-background text-foreground overflow-x-hidden">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:text-sm focus:font-semibold"
        >
          Zum Inhalt springen
        </a>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5 overflow-x-hidden">
          <AppHeader />
          <div id="main-content">{children}</div>
          <footer className="flex flex-wrap items-center justify-between gap-y-2 px-4 py-5 sm:px-8 border-t border-border/15 text-xs text-muted-foreground/60">
            <span>BattleDex</span>
            <div className="flex gap-4">
              <Link href="/impressum" className="hover:text-foreground transition-colors">Impressum</Link>
              <Link href="/datenschutz" className="hover:text-foreground transition-colors">Datenschutz</Link>
              <a href="https://www.reddit.com/user/Saarstriker/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Kontakt</a>
            </div>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
