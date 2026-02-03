"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { FilterBar } from "@/components/filter-bar"
import { PropertyGrid } from "@/components/property-grid"
import type { Property } from "@/lib/properties"

const ITEMS_PER_PAGE = 12

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedArea, setSelectedArea] = useState("all")
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  useEffect(() => {
    fetch("/api/properties")
      .then((res) => res.json())
      .then((data) => {
        setProperties(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load properties:", err)
        setLoading(false)
      })
  }, [])

  // Get areas that have properties (for enabling/disabling filter buttons)
  const activeAreas = useMemo(() => {
    return [...new Set(properties.map((p) => p.area))]
  }, [properties])

  // Filter by area only, show all statuses together
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      return selectedArea === "all" || p.area === selectedArea
    })
  }, [properties, selectedArea])

  const visibleProperties = filteredProperties.slice(0, visibleCount)
  const hasMore = visibleCount < filteredProperties.length

  const handleAreaChange = (area: string) => {
    setSelectedArea(area)
    setVisibleCount(ITEMS_PER_PAGE)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-v4.png"
                alt="ELEA asunnot"
                width={36}
                height={36}
                className="rounded-[8px]"
              />
              <span className="text-lg font-semibold text-primary">ELEA asunnot – tie kotiisi</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {loading ? (
          <div className="text-muted-foreground">Ladataan kohteita...</div>
        ) : (
          <>
            <FilterBar
              selectedArea={selectedArea}
              onAreaChange={handleAreaChange}
              activeAreas={activeAreas}
            />

            <PropertyGrid
              properties={visibleProperties}
              showLoadMore={hasMore}
              onLoadMore={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
            />
          </>
        )}
      </main>

      {/* ============================================
          MEISTÄ-OSIO - Uusi design (värit testattavana)
          Värit:
          --elea-navy: #1B3A5C
          --elea-warm: #C8A96E
          --elea-warm-pale: #F5EFE3
          --elea-bg: #FAF8F5
          --elea-border: #E5DFD6
          ============================================ */}

      {/* Divider */}
      <div
        className="w-full h-px"
        style={{ background: "linear-gradient(90deg, transparent, #E5DFD6, transparent)" }}
      />

      {/* About Hero */}
      <section
        className="py-16 sm:py-[72px] px-6 text-center"
        style={{ background: "#FAF8F5" }}
      >
        <div className="max-w-[720px] mx-auto">
          {/* Label */}
          <div
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-[2px] uppercase mb-6"
            style={{ color: "#C8A96E" }}
          >
            <span className="w-6 h-px" style={{ background: "#C8A96E" }} />
            <span>ELEA asunnot</span>
            <span className="w-6 h-px" style={{ background: "#C8A96E" }} />
          </div>

          {/* Heading */}
          <h2
            className="font-[var(--font-heading)] text-[clamp(28px,4vw,40px)] font-normal leading-[1.3] mb-6"
            style={{ fontFamily: "var(--font-heading), Georgia, serif", color: "#1B3A5C" }}
          >
            Omistamme ja hoidamme&nbsp;—<br />emme vain välitä
          </h2>

          {/* Text */}
          <p
            className="text-[17px] leading-[1.75] max-w-[580px] mx-auto"
            style={{ color: "#6B6560" }}
          >
            ELEA asunnot on perheyritys, joka vuokraa omistajiensa ja heidän
            yritystensä asuntoja pitkäjänteisesti. Meille asunto on koti, ei kauppatavara.
            Siksi pidämme kohteista huolta suunnitelmallisesti ja hoidamme asioinnin
            selkeästi&nbsp;— suoraan omistajilta vuokralaiselle.
          </p>
        </div>
      </section>

      {/* Stats Row */}
      <div
        className="flex justify-center px-6 pb-16 max-w-[640px] mx-auto"
        style={{ background: "#FAF8F5" }}
      >
        <div className="flex w-full max-sm:flex-col max-sm:gap-6 max-sm:items-center">
          {[
            { number: "~100", label: "asuntoa" },
            { number: "6", label: "paikkakuntaa" },
            { number: "1988", label: "vuodesta lähtien" },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex-1 text-center px-5 relative max-sm:px-0"
            >
              <div
                className="text-[clamp(32px,5vw,44px)] font-normal leading-[1.1]"
                style={{ fontFamily: "var(--font-heading), Georgia, serif", color: "#1B3A5C" }}
              >
                {stat.number}
              </div>
              <div
                className="text-[13px] font-medium mt-1.5 tracking-[0.3px]"
                style={{ color: "#8A857E" }}
              >
                {stat.label}
              </div>
              {/* Divider (desktop only, not on last) */}
              {i < 2 && (
                <div
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-10 max-sm:hidden"
                  style={{ background: "#E5DFD6" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Story + Differentiators */}
      <section
        className="border-y"
        style={{ background: "#FFFFFF", borderColor: "#E5DFD6" }}
      >
        <div className="max-w-[1080px] mx-auto px-6 py-16 grid md:grid-cols-2 gap-16 items-start">

          {/* Left: Story */}
          <div>
            <div
              className="text-[11px] font-semibold tracking-[2px] uppercase mb-4"
              style={{ color: "#C8A96E" }}
            >
              Keitä olemme
            </div>
            <h3
              className="text-[clamp(22px,3vw,28px)] font-normal leading-[1.35] mb-5"
              style={{ fontFamily: "var(--font-heading), Georgia, serif", color: "#1B3A5C" }}
            >
              Rakennamme pitkäjänteistä vuokra-asumista, emme nopeita kauppoja
            </h3>
            <div className="space-y-4 text-[15.5px] leading-[1.75]" style={{ color: "#6B6560" }}>
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

          {/* Right: Differentiators */}
          <div>
            <div
              className="text-[11px] font-semibold tracking-[2px] uppercase mb-4"
              style={{ color: "#C8A96E" }}
            >
              Miksi ELEA
            </div>
            <div className="flex flex-col">
              {[
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                    </svg>
                  ),
                  title: "Suora asiointi",
                  desc: "Asioit suoraan omistajan kanssa. Ei välikäsiä, ei viiveitä — selkeää ja nopeaa.",
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085" />
                    </svg>
                  ),
                  title: "Pitkäjänteinen kehittäminen",
                  desc: "Huollamme ja parannamme kohteitamme jatkuvasti. Tavoitteena on koti, joka toimii arjessa.",
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                    </svg>
                  ),
                  title: "Taloyhtiöasiat hallussa",
                  desc: "Vuosikymmenten kokemus taloyhtiöiden taloudesta ja hallinnosta. Ennakoimme korjauksia ja kustannuksia.",
                },
                {
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                  ),
                  title: "Ennakoitavuus",
                  desc: "Tunnemme jokaisen kohteemme historian. Ei ikäviä yllätyksiä — sinulle eikä meille.",
                },
              ].map((item, i, arr) => (
                <div
                  key={i}
                  className="py-6 grid grid-cols-[40px_1fr] gap-4 items-start"
                  style={{
                    borderBottom: i < arr.length - 1 ? "1px solid #E5DFD6" : "none",
                    paddingTop: i === 0 ? 0 : undefined,
                    paddingBottom: i === arr.length - 1 ? 0 : undefined,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
                    style={{ background: "#F5EFE3", color: "#1B3A5C" }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div
                      className="text-[15px] font-semibold mb-1"
                      style={{ color: "#1B3A5C" }}
                    >
                      {item.title}
                    </div>
                    <div
                      className="text-[14px] leading-[1.6]"
                      style={{ color: "#6B6560" }}
                    >
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Contact Strip */}
      <section
        className="py-12 px-6 text-center"
        style={{ background: "#1B3A5C" }}
      >
        <h3
          className="text-[clamp(22px,3vw,28px)] font-normal mb-2"
          style={{ fontFamily: "var(--font-heading), Georgia, serif", color: "#FFFFFF" }}
        >
          Kiinnostuitko?
        </h3>
        <p
          className="text-[15px] mb-7"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          Ota yhteyttä — vastaamme arkisin vuorokauden sisällä
        </p>
        <div className="flex justify-center gap-8 flex-wrap max-sm:flex-col max-sm:items-center max-sm:gap-4">
          <a
            href="tel:+358401234567"
            className="inline-flex items-center gap-2 text-[15px] font-medium transition-colors hover:text-white"
            style={{ color: "#D4BC8A" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px] opacity-70">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
            </svg>
            040 123 4567
          </a>
          <a
            href="mailto:asunnot@elea.fi"
            className="inline-flex items-center gap-2 text-[15px] font-medium transition-colors hover:text-white"
            style={{ color: "#D4BC8A" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[18px] h-[18px] opacity-70">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
            asunnot@elea.fi
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-6 px-6 text-center text-[13px] border-t"
        style={{ color: "#8A857E", borderColor: "#E5DFD6" }}
      >
        © 2026 ELEA asunnot
        <span className="mx-2 opacity-40">·</span>
        Y-tunnus: 1234567-8
      </footer>
    </div>
  )
}
