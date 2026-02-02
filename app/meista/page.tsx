import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Meistä | ELEA asunnot",
  description: "ELEA asunnot - Vuokra-asuntoja laadukkaasta asumisesta kiinnostuneille.",
}

export default function AboutPage() {
  // TODO: Moltbot-integraatio yhteystietoihin
  const contactEmail = "asunnot@elea.fi"
  const contactPhone = "+358 40 123 4567"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-foreground hover:opacity-80">
              <div className="w-8 h-8 rounded-[8px] bg-primary flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-foreground">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="text-lg font-semibold">ELEA asunnot</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                Kohteet
              </Link>
              <Link href="/meista" className="text-sm font-medium text-foreground">
                Meistä
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="space-y-4 mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground">
            Meistä
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            ELEA asunnot tarjoaa laadukkaita vuokra-asuntoja ympäri Suomen.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-12">
          {/* About Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Keitä olemme</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                ELEA asunnot on vuokranantaja, joka keskittyy tarjoamaan laadukkaita ja hyvin ylläpidettyjä
                vuokra-asuntoja. Uskomme, että koti on enemmän kuin pelkkä asunto – se on paikka, jossa elämä tapahtuu.
              </p>
              <p>
                Asuntomme sijaitsevat hyvien liikenneyhteyksien ja palveluiden läheisyydessä.
                Pyrimme pitämään asuntomme hyvässä kunnossa ja vastaamaan vuokralaisten tarpeisiin nopeasti ja ammattimaisesti.
              </p>
            </div>
          </section>

          {/* Values Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Arvomme</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-[16px] border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
                <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Laatu</h3>
                <p className="text-sm text-muted-foreground">
                  Pidämme asunnot hyvässä kunnossa ja huolehdimme säännöllisestä ylläpidosta.
                </p>
              </div>
              <div className="rounded-[16px] border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
                <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Palvelu</h3>
                <p className="text-sm text-muted-foreground">
                  Vastaamme yhteydenottoihin nopeasti ja autamme kaikissa asumiseen liittyvissä asioissa.
                </p>
              </div>
              <div className="rounded-[16px] border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
                <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Luotettavuus</h3>
                <p className="text-sm text-muted-foreground">
                  Toimimme ammattimaisesti ja avoimesti kaikessa vuokraustoiminnassamme.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Ota yhteyttä</h2>
            <div className="rounded-[16px] border border-border/70 bg-card p-8 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Kiinnostuitko asunnoistamme tai haluatko lisätietoja? Ota rohkeasti yhteyttä!
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={`mailto:${contactEmail}`}
                    className="inline-flex items-center justify-center gap-2 rounded-[12px] px-6 py-3 bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    {contactEmail}
                  </a>
                  <a
                    href={`tel:${contactPhone.replace(/\s/g, "")}`}
                    className="inline-flex items-center justify-center gap-2 rounded-[12px] px-6 py-3 border border-border/70 text-foreground font-medium hover:bg-secondary/50 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {contactPhone}
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              ELEA asunnot
            </p>
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                Kohteet
              </Link>
              <Link href="/meista" className="text-sm text-muted-foreground hover:text-foreground">
                Meistä
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
