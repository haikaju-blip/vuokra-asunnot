"use client"

import type { Property } from "@/lib/properties"

interface KeyFactsBarProps {
  property: Property
}

interface FactItem {
  icon: React.ReactNode
  label: string
  value: string
}

export function KeyFactsBar({ property }: KeyFactsBarProps) {
  const facts: FactItem[] = []

  // Neliöt
  if (property.size > 0) {
    facts.push({
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      ),
      label: "Pinta-ala",
      value: `${property.size} m²`,
    })
  }

  // Huoneet
  if (property.rooms > 0) {
    facts.push({
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      label: "Huoneet",
      value: `${property.rooms}h`,
    })
  }

  // Kerros
  if (property.floor !== undefined && property.floor > 0) {
    const floorText = property.totalFloors
      ? `${property.floor}/${property.totalFloors}`
      : `${property.floor}.`
    facts.push({
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="8" y1="6" x2="16" y2="6" />
          <line x1="8" y1="10" x2="16" y2="10" />
          <line x1="8" y1="14" x2="16" y2="14" />
          <line x1="8" y1="18" x2="16" y2="18" />
        </svg>
      ),
      label: "Kerros",
      value: floorText,
    })
  }

  // Rakennusvuosi
  if (property.yearBuilt !== undefined && property.yearBuilt > 0) {
    facts.push({
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      label: "Rakennettu",
      value: `${property.yearBuilt}`,
    })
  }

  // Parveke
  if (property.balcony === true) {
    facts.push({
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12h18" />
          <path d="M3 12v8" />
          <path d="M21 12v8" />
          <path d="M12 12v8" />
          <path d="M3 20h18" />
          <path d="M6 12V3" />
          <path d="M18 12V3" />
          <path d="M6 3h12" />
        </svg>
      ),
      label: "Parveke",
      value: "Kyllä",
    })
  }

  // Jos ei ole yhtään faktaa, älä renderöi mitään
  if (facts.length === 0) return null

  return (
    <div className="flex flex-wrap gap-4 sm:gap-6">
      {facts.map((fact, index) => (
        <div key={index} className="flex items-center gap-2 text-muted-foreground">
          <span className="text-foreground/70">{fact.icon}</span>
          <span className="text-sm font-medium text-foreground">{fact.value}</span>
        </div>
      ))}
    </div>
  )
}
