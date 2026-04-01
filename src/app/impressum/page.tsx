import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Impressum | BattleDex",
}

export default function ImpressumPage() {
  return (
    <main className="relative flex-1 px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-black uppercase tracking-tight">Impressum</h1>

        <Card className="border-border/40 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">Angaben gemäß § 5 TMG</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>Max Mustermann</p>
            <p>Musterstraße 1</p>
            <p>12345 Musterstadt</p>
            <p>Deutschland</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">Kontakt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-muted-foreground">
            <p>E-Mail: kontakt@battledex.app</p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">Haftungsausschluss</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <p className="mb-1 font-semibold text-foreground">Haftung für Inhalte</p>
              <p>
                Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
                Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
              </p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-foreground">Haftung für Links</p>
              <p>
                Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
                Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
                oder Betreiber der Seiten verantwortlich.
              </p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-foreground">Urheberrecht</p>
              <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
                dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
                der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
                Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
