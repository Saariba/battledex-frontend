import type {Metadata} from 'next';
import { Toaster } from 'sonner';
import { AppHeader } from '@/components/app-header';
import './globals.css';

export const metadata: Metadata = {
  title: 'BattleDex | Neural Punchline Database',
  description: 'Neural database indexing the hardest rap battle bars by meaning, context, and style.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&family=Roboto+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
          <AppHeader />
          {children}
          <footer className="p-8 text-center border-t border-border/20 text-muted-foreground text-[10px] font-mono uppercase tracking-[0.2em]">
            BATTLEDEX &bull; Neural Punchline Database
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
