"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { FilterBar } from "@/components/filter-bar"
import { PropertyGrid } from "@/components/property-grid"
import type { Property } from "@/lib/properties"

const ITEMS_PER_PAGE = 4

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedArea, setSelectedArea] = useState("all")
  const [selectedTab, setSelectedTab] = useState<"available" | "upcoming">("available")
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

  // Get unique areas from properties
  const areas = useMemo(() => {
    const uniqueAreas = [...new Set(properties.map((p) => p.area))]
    return uniqueAreas.sort()
  }, [properties])

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchesArea = selectedArea === "all" || p.area === selectedArea
      return matchesArea && p.status === selectedTab
    })
  }, [properties, selectedArea, selectedTab])

  const counts = useMemo(() => {
    const filtered = properties.filter((p) => {
      const matchesArea = selectedArea === "all" || p.area === selectedArea
      return matchesArea
    })
    return {
      available: filtered.filter((p) => p.status === "available").length,
      upcoming: filtered.filter((p) => p.status === "upcoming").length,
    }
  }, [properties, selectedArea])

  const visibleProperties = filteredProperties.slice(0, visibleCount)
  const hasMore = visibleCount < filteredProperties.length

  const handleAreaChange = (area: string) => {
    setSelectedArea(area)
    setVisibleCount(ITEMS_PER_PAGE)
  }
  const handleTabChange = (tab: "available" | "upcoming") => {
    setSelectedTab(tab)
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
              selectedTab={selectedTab}
              onTabChange={handleTabChange}
              availableCount={counts.available}
              upcomingCount={counts.upcoming}
              areas={areas}
            />

            <PropertyGrid
              properties={visibleProperties}
              showLoadMore={hasMore}
              onLoadMore={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
            />
          </>
        )}
      </main>

      {/* Meistä-osio */}
      <section className="bg-muted/30 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          {/* Intro */}
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              ELEA asunnot
            </h2>
            <p className="text-muted-foreground text-balance">
              ELEA asunnot on perheyritys, joka vuokraa omia asuntojaan pitkäjänteisesti.
              Meille asunto on koti, ei kauppatavara. Siksi pidämme kohteista huolta
              suunnitelmallisesti ja hoidamme asioinnin selkeästi – suoraan omistajalta vuokralaiselle.
            </p>
          </div>

          {/* Keitä olemme + Mikä tekee meistä erilaisen */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Keitä olemme */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Keitä olemme</h3>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Olemme omistaneet asuntoja 1980-luvulta lähtien. Toimintamme alkoi Oulussa,
                  ja 2000-luvulta alkaen olemme laajentaneet myös pääkaupunkiseudulle.
                </p>
                <p>
                  Emme rakenna toimintaa nopean ostamisen ja myymisen varaan. Omistamme kohteemme
                  vuosikymmenien ajan ja kehitämme niitä maltilla, jotta asuminen pysyy hyvänä
                  vuodesta toiseen.
                </p>
              </div>
            </div>

            {/* Mikä tekee meistä erilaisen */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Mikä tekee meistä erilaisen</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-[12px] bg-card border border-border/70 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
                  <h4 className="font-medium text-foreground mb-1">Suora asiointi</h4>
                  <p className="text-sm text-muted-foreground">
                    Asioit suoraan omistavan tahon kanssa. Viestintä on selkeää ja reagointi nopeaa.
                  </p>
                </div>
                <div className="p-4 rounded-[12px] bg-card border border-border/70 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
                  <h4 className="font-medium text-foreground mb-1">Pitkäjänteinen kehittäminen</h4>
                  <p className="text-sm text-muted-foreground">
                    Huollamme ja parannamme kohteita suunnitelmallisesti, jotta koti toimii käytännössä.
                  </p>
                </div>
                <div className="p-4 rounded-[12px] bg-card border border-border/70 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
                  <h4 className="font-medium text-foreground mb-1">Taloyhtiöasiat hallussa</h4>
                  <p className="text-sm text-muted-foreground">
                    Pitkä kokemus taloyhtiöiden taloudesta ja hallinnosta. Ennakoimme korjauksia ja kustannuksia.
                  </p>
                </div>
                <div className="p-4 rounded-[12px] bg-card border border-border/70 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
                  <h4 className="font-medium text-foreground mb-1">Ennakoitavuus</h4>
                  <p className="text-sm text-muted-foreground">
                    Kun tunnemme kohteet ja niiden taustan, yllätyksiä tulee vähemmän.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-sm text-muted-foreground text-center">
            © 2026 ELEA asunnot. Kaikki oikeudet pidätetään.
          </p>
        </div>
      </footer>
    </div>
  )
}
