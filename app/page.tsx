"use client"

import { useState, useMemo } from "react"
import { FilterBar } from "@/components/filter-bar"
import { PropertyGrid } from "@/components/property-grid"
import { allProperties } from "@/lib/properties"

const ITEMS_PER_PAGE = 4

export default function PropertiesPage() {
  const [selectedArea, setSelectedArea] = useState("all")
  const [selectedTab, setSelectedTab] = useState<"available" | "upcoming">("available")
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  const filteredProperties = useMemo(() => {
    return allProperties.filter((p) => {
      const matchesArea = selectedArea === "all" || (selectedArea === "area-a" && p.area === "Alue A") || (selectedArea === "area-b" && p.area === "Alue B")
      return matchesArea && p.status === selectedTab
    })
  }, [selectedArea, selectedTab])

  const counts = useMemo(() => {
    const filtered = allProperties.filter((p) => {
      const matchesArea = selectedArea === "all" || (selectedArea === "area-a" && p.area === "Alue A") || (selectedArea === "area-b" && p.area === "Alue B")
      return matchesArea
    })
    return {
      available: filtered.filter((p) => p.status === "available").length,
      upcoming: filtered.filter((p) => p.status === "upcoming").length,
    }
  }, [selectedArea])

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
              <div className="w-8 h-8 rounded-[8px] bg-primary flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-foreground">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-foreground">Kohteet</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight text-balance">
            Löydä unelmiesi koti
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Valitse alue ja katso vapaat tai pian vapautuvat kohteet.
          </p>
        </div>

        <FilterBar
          selectedArea={selectedArea}
          onAreaChange={handleAreaChange}
          selectedTab={selectedTab}
          onTabChange={handleTabChange}
          availableCount={counts.available}
          upcomingCount={counts.upcoming}
        />

        <PropertyGrid
          properties={visibleProperties}
          showLoadMore={hasMore}
          onLoadMore={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
        />
      </main>

      <footer className="border-t border-border bg-card mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-sm text-muted-foreground text-center">
            © 2026 Kohteet. Kaikki oikeudet pidätetään.
          </p>
        </div>
      </footer>
    </div>
  )
}
