import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Datenschutzerklärung | BattleDex",
}

export default function DatenschutzPage() {
  return (
    <main className="relative flex-1 px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-black uppercase tracking-tight">Datenschutzerklärung</h1>

        <Card className="border-border/40 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">1. Verantwortlicher</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Verantwortlich für die Datenverarbeitung auf dieser Website ist der im{" "}
              <a href="/impressum" className="text-primary hover:underline">Impressum</a>{" "}
              genannte Betreiber.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">2. Allgemeines zur Datenverarbeitung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Der Schutz deiner persönlichen Daten ist uns wichtig. Wir verarbeiten personenbezogene
              Daten nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer
              Inhalte und Leistungen erforderlich ist. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO
              (berechtigtes Interesse an einem stabilen, sicheren und performanten Betrieb der Website).
            </p>
            <p>
              Es werden <strong>keine Benutzerkonten</strong> angelegt. Es ist <strong>keine Registrierung</strong>{" "}
              erforderlich. Die Website setzt <strong>keine Cookies</strong> und verwendet{" "}
              <strong>kein Tracking durch Drittanbieter</strong> (kein Google Analytics, kein Facebook Pixel o.&thinsp;Ä.).
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">3. Hosting & Server-Logfiles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Diese Website wird auf einem Server bei <strong>Hetzner Online GmbH</strong>{" "}
              (Industriestr. 25, 91710 Gunzenhausen, Deutschland) gehostet. Beim Aufruf der Website
              werden vom Webserver automatisch sogenannte Server-Logfiles erfasst. Diese enthalten:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Aufgerufene Seite / Endpunkt</li>
              <li>Datum und Uhrzeit des Zugriffs</li>
              <li>HTTP-Statuscode</li>
              <li>Übertragene Datenmenge</li>
              <li>Referrer-URL</li>
              <li>Browser und Betriebssystem</li>
              <li>IP-Adresse (nur pseudonymisiert, siehe Abschnitt 5)</li>
            </ul>
            <p>
              Diese Daten sind nicht bestimmten Personen zuordenbar. Eine Zusammenführung mit
              anderen Datenquellen wird nicht vorgenommen.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">4. Web-Analyse mit Umami</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Wir nutzen <strong>Umami</strong>, eine datenschutzfreundliche, quelloffene Web-Analyse-Software.
              Umami wird <strong>selbst gehostet</strong> auf unserem eigenen Server in Deutschland (Hetzner).
              Es werden <strong>keine Daten an Dritte</strong> übermittelt.
            </p>
            <p>Umami erfasst:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Seitenaufrufe (welche Seite, Zeitpunkt)</li>
              <li>Verweisquelle (Referrer)</li>
              <li>Land (abgeleitet aus IP, ohne Speicherung der IP)</li>
              <li>Gerätetyp, Browser und Betriebssystem</li>
            </ul>
            <p>
              Umami setzt <strong>keine Cookies</strong> und speichert <strong>keine IP-Adressen</strong>.
              Es werden keine individuellen Nutzerprofile erstellt. Ein Opt-out ist daher nicht
              erforderlich, da kein personenbezogenes Tracking stattfindet.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">5. API-Nutzungsanalyse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Um die Stabilität und Performance unserer Suchfunktion sicherzustellen, erfassen wir
              bei API-Anfragen folgende Daten:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Aufgerufener Endpunkt und HTTP-Methode</li>
              <li>HTTP-Statuscode und Antwortzeit</li>
              <li>Pseudonymisierter IP-Hash (SHA-256, gekürzt auf 16 Zeichen — ein Rückschluss auf die Original-IP ist nicht möglich)</li>
            </ul>
            <p>
              Zusätzlich werden <strong>Suchanfragen</strong> (eingegebener Suchbegriff, Suchmodus,
              Anzahl der Treffer, Antwortzeit) gespeichert, um populäre Suchbegriffe anzuzeigen und
              die Suchqualität zu verbessern.
            </p>
            <p>
              Die Daten werden in einer Datenbank bei <strong>Supabase Inc.</strong> gespeichert
              (Region: EU / Frankfurt). Supabase fungiert als Auftragsverarbeiter gem. Art. 28 DSGVO.
              Weitere Informationen:{" "}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                supabase.com/privacy
              </a>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">6. Lokale Speicherung (localStorage)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Die Website nutzt den <strong>localStorage</strong> deines Browsers, um Einstellungen
              lokal auf deinem Gerät zu speichern. Dies umfasst:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Letzte Suchanfragen (für die „Zuletzt gesucht"-Funktion)</li>
              <li>UI-Einstellungen (z.&thinsp;B. ob ein Hinweis geschlossen wurde)</li>
            </ul>
            <p>
              Diese Daten verlassen <strong>niemals dein Gerät</strong> und werden nicht an unseren
              Server übertragen. Du kannst sie jederzeit über die Browser-Einstellungen löschen.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">7. Externe Inhalte (YouTube)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Wir binden <strong>YouTube-Thumbnails</strong> (Vorschaubilder) ein, die von Servern
              von Google Ireland Limited geladen werden. Dabei wird deine IP-Adresse an Google
              übermittelt.
            </p>
            <p>
              Zusätzlich werden <strong>YouTube-Videos</strong> über einen eingebetteten Player
              (iframe via youtube.com) direkt auf unserer Website abgespielt, wenn du auf
              „Video abspielen" klickst. Erst durch diesen Klick wird eine Verbindung zu
              YouTube-Servern hergestellt. Dabei können Cookies von Google gesetzt und
              weitere Daten (z.&thinsp;B. IP-Adresse, Geräte-Informationen) an Google
              übermittelt werden.
            </p>
            <p>
              Weitere Informationen:{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Datenschutzerklärung
              </a>
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">8. Deine Rechte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Du hast gemäß DSGVO folgende Rechte:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Auskunft</strong> (Art. 15) — Welche Daten wir über dich gespeichert haben</li>
              <li><strong>Berichtigung</strong> (Art. 16) — Korrektur unrichtiger Daten</li>
              <li><strong>Löschung</strong> (Art. 17) — Löschung deiner Daten</li>
              <li><strong>Einschränkung</strong> (Art. 18) — Einschränkung der Verarbeitung</li>
              <li><strong>Widerspruch</strong> (Art. 21) — Widerspruch gegen die Verarbeitung</li>
              <li><strong>Datenübertragbarkeit</strong> (Art. 20) — Herausgabe deiner Daten in maschinenlesbarem Format</li>
            </ul>
            <p>
              Da wir keine personenbezogenen Konten führen und IP-Adressen nur pseudonymisiert
              speichern, ist eine Zuordnung zu deiner Person in der Regel nicht möglich. Wenn du
              dennoch eines der oben genannten Rechte ausüben möchtest, kontaktiere uns bitte
              über die im{" "}
              <a href="/impressum" className="text-primary hover:underline">Impressum</a>{" "}
              genannte E-Mail-Adresse.
            </p>
            <p>
              Darüber hinaus hast du das Recht, dich bei einer <strong>Datenschutz-Aufsichtsbehörde</strong>{" "}
              zu beschweren (Art. 77 DSGVO).
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">9. Änderungen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte
              Rechtslagen oder Änderungen der Website anzupassen. Die aktuelle Version findest
              du stets auf dieser Seite.
            </p>
            <p className="text-muted-foreground/60">Stand: April 2026</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
