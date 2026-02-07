import type { Metadata } from "next"
import { getProperties } from "@/lib/properties"
import { PropertyListClient } from "@/components/property-list-client"

// Force dynamic rendering - changes to properties.json are reflected immediately
export const dynamic = "force-dynamic"

// Etusivun metadata (yliajaa layout.tsx:n oletusotsikon)
export const metadata: Metadata = {
  title: "Vapaat vuokra-asunnot | ELEA asunnot",
  description: "Selaa ELEA:n vapaita ja pian vapautuvia vuokra-asuntoja. Laadukkaita koteja kuudella paikkakunnalla.",
  openGraph: {
    title: "Vapaat vuokra-asunnot | ELEA asunnot",
    description: "Selaa ELEA:n vapaita ja pian vapautuvia vuokra-asuntoja.",
    images: [{ url: "/og-etusivu.webp", width: 1200, height: 630, alt: "ELEA asunnot" }],
  },
}

// Organization JSON-LD (SEO)
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ELEA asunnot",
  url: "https://asunnot.elea.fi",
  logo: "https://asunnot.elea.fi/logo-v4.png",
  description: "Perheyritys vuodesta 1988. Vuokra-asuntoja kuudella paikkakunnalla.",
  foundingDate: "1988",
}

export default function PropertiesPage() {
  // Server-side data fetching - SEO-friendly!
  const properties = getProperties()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <div className="min-h-screen bg-elea-bg">
      {/* Header */}
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E5DFD6' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Desktop/tablet: yksirivinen */}
          <div className="hidden sm:flex h-16 items-center justify-between">
            <a href="/" className="flex items-baseline" style={{ marginLeft: 31 }}>
              <span
                className="font-serif"
                style={{ fontSize: 26, color: '#1B3A5C', letterSpacing: '-0.3px' }}
              >
                ELEA<span style={{ color: '#C8A96E' }}>.</span>
              </span>
            </a>
            <div className="flex items-center gap-1.5" style={{ fontSize: 13, color: '#8A857E', marginRight: 28 }}>
              <span>~100 asuntoa</span>
              <span className="w-px h-3.5 mx-1.5" style={{ background: '#E5DFD6' }} />
              <span>6 paikkakuntaa</span>
              <span className="w-px h-3.5 mx-1.5" style={{ background: '#E5DFD6' }} />
              <span>vuodesta 1988</span>
            </div>
          </div>
          {/* Mobiili: 2-rivinen */}
          <div className="sm:hidden py-3 px-2">
            <a href="/" className="block">
              <span
                className="font-serif"
                style={{ fontSize: 22, color: '#1B3A5C' }}
              >
                ELEA<span style={{ color: '#C8A96E' }}>.</span>
              </span>
            </a>
            <div style={{ fontSize: 12, color: '#8A857E', marginTop: 4 }}>
              ~100 asuntoa · 6 paikkakuntaa · 1988 lähtien
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1200px] mx-auto px-6 py-5 space-y-4">
        <PropertyListClient properties={properties} />
      </main>

      {/* ═══ MEISTÄ — Yksi valkoinen blokki ═══ */}
      <section className="bg-white border-t border-b border-elea-border">
        <div className="max-w-[1200px] mx-auto" style={{ padding: '52px 24px' }}>

          {/* Kaksi palstaa */}
          <div className="grid grid-cols-1 md:grid-cols-2 items-start" style={{ gap: 64 }}>

            {/* Vasen: Keitä olemme */}
            <div>
              <div className="uppercase text-elea-warm" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, marginBottom: 14 }}>
                Keitä olemme
              </div>
              <h3 className="font-serif text-elea-navy" style={{ fontSize: 24, fontWeight: 400, lineHeight: 1.35, marginBottom: 18 }}>
                Meille asunto on koti, ei&nbsp;kauppatavara
              </h3>
              <p className="text-elea-text-muted" style={{ fontSize: 15, lineHeight: 1.75 }}>
                ELEA on ensimmäisen lapsenlapsemme nimi ja lupaus
                jatkuvuudesta. Olemme omistaneet asuntoja vuodesta 1988
                — emme myydäksemme, vaan pitääksemme.
              </p>
              <p className="text-elea-text-muted" style={{ fontSize: 15, lineHeight: 1.75, marginTop: 14 }}>
                Hoidamme kohteemme itse, tunnemme niiden historian ja
                kehitämme niitä maltilla. Vuokralaiselle se näkyy
                yksinkertaisesti: koti joka toimii.
              </p>
            </div>

            {/* Oikea: Miksi ELEA */}
            <div>
              <div className="uppercase text-elea-warm" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, marginBottom: 14 }}>
                Miksi ELEA
              </div>
              <div className="flex flex-col">
                {[
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={18} height={18}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                      </svg>
                    ),
                    title: "Suora asiointi",
                    desc: "Asioit suoraan omistajan kanssa. Ei välikäsiä, ei viiveitä.",
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={18} height={18}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
                      </svg>
                    ),
                    title: "Pitkäjänteinen kehittäminen",
                    desc: "Huollamme ja parannamme kohteitamme jatkuvasti. Koti, joka toimii arjessa.",
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={18} height={18}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                      </svg>
                    ),
                    title: "Taloyhtiöasiat hallussa",
                    desc: "Vuosikymmenten kokemus taloudesta ja hallinnosta. Ennakoimme korjauksia.",
                  },
                  {
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={18} height={18}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                      </svg>
                    ),
                    title: "Ennakoitavuus",
                    desc: "Tunnemme jokaisen kohteemme historian. Ei ikäviä yllätyksiä.",
                  },
                ].map((item, i, arr) => (
                  <div
                    key={i}
                    className="grid items-start"
                    style={{
                      gridTemplateColumns: '38px 1fr',
                      gap: 14,
                      padding: i === 0 ? '0 0 16px 0' : i === arr.length - 1 ? '16px 0 0 0' : '16px 0',
                      borderBottom: i < arr.length - 1 ? '1px solid #E5DFD6' : 'none',
                    }}
                  >
                    <div
                      className="flex items-center justify-center text-elea-navy"
                      style={{ width: 38, height: 38, borderRadius: 9, background: '#F5EFE3', flexShrink: 0 }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-elea-navy" style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
                        {item.title}
                      </div>
                      <div className="text-elea-text-muted" style={{ fontSize: 13, lineHeight: 1.55 }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ background: '#1B3A5C' }}>
        <div className="max-w-[1200px] mx-auto text-center" style={{ padding: '44px 24px' }}>
          <h3 className="font-serif" style={{ fontSize: 22, color: '#fff', marginBottom: 6 }}>
            Kiinnostuitko?
          </h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
            Ota yhteyttä — vastaamme arkisin vuorokauden sisällä
          </p>
          <div className="flex justify-center" style={{ gap: 28 }}>
            <a
              href="tel:+358401234567"
              className="inline-flex items-center no-underline transition-colors hover:text-white"
              style={{ gap: 7, fontSize: 15, fontWeight: 500, color: '#D4BC8A' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={16} height={16} style={{ opacity: 0.6 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
              040 XXX XXXX
            </a>
            <a
              href="mailto:asunnot@elea.fi"
              className="inline-flex items-center no-underline transition-colors hover:text-white"
              style={{ gap: 7, fontSize: 15, fontWeight: 500, color: '#D4BC8A' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width={16} height={16} style={{ opacity: 0.6 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              asunnot@elea.fi
            </a>
          </div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="max-w-[1200px] mx-auto text-center text-elea-text-light" style={{ padding: '20px 24px', fontSize: 12 }}>
        © 2026 ELEA asunnot
        <span style={{ margin: '0 6px', opacity: 0.4 }}>·</span>
        Y-tunnus: XXXXXXX-X
      </footer>
    </div>
    </>
  )
}
