"use client"

import { useState, useMemo } from "react"
import { FilterBar } from "@/components/filter-bar"
import { PropertyGrid } from "@/components/property-grid"
import type { Property } from "@/lib/properties"

const ITEMS_PER_PAGE = 12

interface PropertyListClientProps {
  properties: Property[]
}

export function PropertyListClient({ properties }: PropertyListClientProps) {
  const [selectedArea, setSelectedArea] = useState("all")
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  const activeAreas = useMemo(() => {
    return [...new Set(properties.map((p) => p.area))]
  }, [properties])

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
  )
}
