"use client"

import { useState, useMemo, useCallback } from "react"
import { FilterBar } from "@/components/filter-bar"
import { PropertyGrid } from "@/components/property-grid"
import { ContactModal } from "@/components/contact-modal"
import type { Property } from "@/lib/properties"

const ITEMS_PER_PAGE = 12

interface PropertyListClientProps {
  properties: Property[]
}

export function PropertyListClient({ properties }: PropertyListClientProps) {
  const [selectedArea, setSelectedArea] = useState("all")
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const [contactModal, setContactModal] = useState<{
    isOpen: boolean
    property: Property | null
  }>({ isOpen: false, property: null })

  const openContactModal = useCallback((property: Property) => {
    setContactModal({ isOpen: true, property })
  }, [])

  const closeContactModal = useCallback(() => {
    setContactModal({ isOpen: false, property: null })
  }, [])

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
        onContactClick={openContactModal}
      />

      <ContactModal
        property={contactModal.property}
        isOpen={contactModal.isOpen}
        onClose={closeContactModal}
      />
    </>
  )
}
