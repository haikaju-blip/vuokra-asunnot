import { getProperties } from "@/lib/properties"
import { PropertyListClient } from "@/components/property-list-client"

export default function PropertiesPage() {
  // Server-side data fetching - SEO-friendly!
  const properties = getProperties()

  return (
    <div className="min-h-screen bg-elea-bg">
      {/* Header */}
      <header className="bg-card border-b border-elea-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <a href="/" className="flex items-center gap-3">
              <span className="text-[24px] tracking-[1.5px] font-serif text-elea-navy">
                ELEA<span className="text-elea-warm">.</span>
              </span>
              <span className="hidden sm:block h-5 w-px bg-elea-border" />
              <span className="hidden sm:block text-[12px] text-elea-text-light">
                tie kotiisi
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-4">
        <PropertyListClient properties={properties} />
      </main>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-elea-border to-transparent" />

      {/* ═══ MEISTÄ: Brändi-intro + tilastot ═══ */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 bg-elea-bg-warm">
        <div className="max-w-[1080px] mx-auto grid md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center">
          {/* Vasen: otsikko + teksti */}
          <div>
            <div className="inline-flex items-center gap-2.5 text-[11px] font-semibold tracking-[2.5px] uppercase mb-4 text-elea-warm">
              <span className="w-5 h-px bg-elea-warm" />
              <span>ELEA asunnot</span>
              <span className="w-5 h-px bg-elea-warm" />
            </div>
            <h2 className="text-[28px] sm:text-[32px] font-normal leading-[1.25] mb-4 font-serif text-elea-navy">
              Omistamme ja hoidamme&nbsp;—<br />emme vain välitä
            </h2>
            <p className="text-[15px] leading-[1.7] max-w-[540px] text-elea-text-muted">
              ELEA asunnot on perheyritys, joka vuokraa omistajiensa ja heidän
              yritystensä asuntoja pitkäjänteisesti. Meille asunto on koti, ei
              kauppatavara — suoraan omistajilta vuokralaiselle.
            </p>
          </div>

          {/* Oikea: tilastot */}
          <div className="flex gap-8 max-sm:gap-6 max-sm:justify-start">
            {[
              { number: "~100", label: "asuntoa" },
              { number: "6", label: "paikkakuntaa" },
              { number: "1988", label: "vuodesta lähtien" },
            ].map((stat, i) => (
              <div key={i} className="text-center relative">
                <div className="text-[32px] sm:text-[36px] font-normal leading-[1.1] font-serif text-elea-navy">
                  {stat.number}
                </div>
                <div className="text-[12px] font-medium mt-1 tracking-[0.3px] text-elea-text-light">
                  {stat.label}
                </div>
                {i < 2 && (
                  <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-px h-9 max-sm:hidden bg-elea-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MEISTÄ: Tarina + Erottautumistekijät ═══ */}
      <section className="border-y bg-card border-elea-border">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-6 py-10 sm:py-12 grid md:grid-cols-2 gap-10 md:gap-14 items-start">
          {/* Vasen: Tarina */}
          <div>
            <div className="text-[11px] font-semibold tracking-[2px] uppercase mb-3 text-elea-warm">
              Keitä olemme
            </div>
            <h3 className="text-[22px] sm:text-[24px] font-normal leading-[1.35] mb-4 font-serif text-elea-navy">
              Rakennamme pitkäjänteistä vuokra-asumista, emme nopeita kauppoja
            </h3>
            <div className="space-y-3 text-[15px] leading-[1.7] text-elea-text-muted">
              <p>
                Olemme omistaneet asuntoja vuodesta 1988. Toimintamme alkoi
                Oulussa, ja 2000-luvulta alkaen olemme laajentaneet myös
                pääkaupunkiseudulle.
              </p>
              <p>
                Emme rakenna toimintaa nopean ostamisen ja myymisen varaan.
                Omistamme kohteemme vuosikymmeniä ja kehitämme niitä maltilla,
                jotta asuminen pysyy hyvänä vuodesta toiseen.
              </p>
            </div>
          </div>

          {/* Oikea: Erottautumistekijät */}
          <div>
            <div className="text-[11px] font-semibold tracking-[2px] uppercase mb-3 text-elea-warm">
              Miksi ELEA
            </div>
            <div className="flex flex-col">
              {[
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                    </svg>
                  ),
                  title: "Suora asiointi",
                  desc: "Asioit suoraan omistajan kanssa. Ei välikäsiä, ei viiveitä.",
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
                    </svg>
                  ),
                  title: "Pitkäjänteinen kehittäminen",
                  desc: "Huollamme ja parannamme kohteitamme jatkuvasti. Koti, joka toimii arjessa.",
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                    </svg>
                  ),
                  title: "Taloyhtiöasiat hallussa",
                  desc: "Vuosikymmenten kokemus taloudesta ja hallinnosta. Ennakoimme korjauksia.",
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                  ),
                  title: "Ennakoitavuus",
                  desc: "Tunnemme jokaisen kohteemme historian. Ei ikäviä yllätyksiä.",
                },
              ].map((item, i, arr) => (
                <div
                  key={i}
                  className={`py-4 grid grid-cols-[36px_1fr] gap-3.5 items-start ${i < arr.length - 1 ? "border-b border-elea-border" : ""} ${i === 0 ? "pt-0" : ""} ${i === arr.length - 1 ? "pb-0" : ""}`}
                >
                  <div className="w-[36px] h-[36px] rounded-[9px] flex items-center justify-center flex-shrink-0 bg-elea-warm-pale text-elea-navy">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold mb-0.5 text-elea-navy">
                      {item.title}
                    </div>
                    <div className="text-[13px] leading-[1.55] text-elea-text-muted">
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-10 px-4 sm:px-6 text-center bg-elea-navy">
        <h3 className="text-[20px] sm:text-[24px] font-normal mb-2 font-serif text-white">
          Kiinnostuitko?
        </h3>
        <p className="text-[14px] mb-6 text-white/55">
          Ota yhteyttä — vastaamme arkisin vuorokauden sisällä
        </p>
        <div className="flex justify-center gap-7 flex-wrap max-sm:flex-col max-sm:items-center max-sm:gap-3">
          <a
            href="tel:+358XXXXXXXXX"
            className="inline-flex items-center gap-2 text-[15px] font-medium transition-colors hover:text-white text-elea-warm-light"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 opacity-70">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
            </svg>
            040 XXX XXXX
          </a>
          <a
            href="mailto:asunnot@elea.fi"
            className="inline-flex items-center gap-2 text-[15px] font-medium transition-colors hover:text-white text-elea-warm-light"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 opacity-70">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
            asunnot@elea.fi
          </a>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="py-5 px-4 sm:px-6 text-center text-[12px] text-elea-text-light">
        © 2026 ELEA asunnot
        <span className="mx-2 opacity-40">·</span>
        Y-tunnus: XXXXXXX-X
      </footer>
    </div>
  )
}
