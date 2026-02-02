"use client"

import { useState } from "react"
import dynamic from "next/dynamic"

// Lazy load map component - Leaflet requires window object
const PropertyMap = dynamic(() => import("./property-map").then(mod => mod.PropertyMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-muted rounded-[16px] flex items-center justify-center">
      <span className="text-muted-foreground text-sm">Ladataan karttaa...</span>
    </div>
  ),
})

interface LocationSectionProps {
  address: string
  name: string
  location: string
  lat?: number
  lng?: number
}

export function LocationSection({ address, name, location, lat, lng }: LocationSectionProps) {
  // Desktop: show map immediately
  // Mobile: show "Näytä kartta" button first
  const [showMap, setShowMap] = useState(false)

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Sijainti</h2>
      <p className="text-sm text-muted-foreground">{address}</p>

      {/* Desktop: always show map */}
      <div className="hidden md:block">
        <div className="rounded-[16px] overflow-hidden border border-border/70 h-[300px]">
          <PropertyMap address={address} name={name} lat={lat} lng={lng} />
        </div>
      </div>

      {/* Mobile: show button first, then map */}
      <div className="md:hidden">
        {showMap ? (
          <div className="rounded-[16px] overflow-hidden border border-border/70 h-[300px]">
            <PropertyMap address={address} name={name} lat={lat} lng={lng} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowMap(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-[16px] border border-border/70 bg-secondary/50 hover:bg-secondary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" y1="3" x2="9" y2="18" />
              <line x1="15" y1="6" x2="15" y2="21" />
            </svg>
            <span className="font-medium text-foreground">Näytä kartta</span>
          </button>
        )}
      </div>
    </section>
  )
}
