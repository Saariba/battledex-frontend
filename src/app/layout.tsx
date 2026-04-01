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
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
          <AppHeader />
          {children}
          <footer className="flex items-center justify-center gap-3 p-8 border-t border-border/20 text-muted-foreground text-[10px] font-mono uppercase tracking-[0.2em]">
            <span>BATTLEDEX &bull; Punchline-Datenbank</span>
            <span>&bull;</span>
            <Link href="/impressum" className="hover:text-foreground transition-colors">Impressum</Link>
            <span>&bull;</span>
            <a href="https://www.reddit.com/user/Saarstriker/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Kontakt</a>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
