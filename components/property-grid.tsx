"use client"

import { PropertyCard } from "./property-card"
import type { Property } from "@/lib/properties"

interface PropertyGridProps {
  properties: Property[]
  showLoadMore: boolean
  onLoadMore: () => void
  isLoading?: boolean
}

export function PropertyGrid({
  properties,
  showLoadMore,
  onLoadMore,
  isLoading = false,
}: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-secondary flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted-foreground"
            aria-hidden="true"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">Ei kohteita</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Valitsemillasi valinnoilla ei löytynyt kohteita. Kokeile vaihtaa aluetta tai välilehteä.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
      {showLoadMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-[12px] bg-card border border-border/80 text-foreground font-medium text-sm hover:bg-secondary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Ladataan..." : "Näytä lisää"}
          </button>
        </div>
      )}
    </div>
  )
}
