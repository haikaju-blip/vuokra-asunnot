"use client"

import { cn } from "@/lib/utils"

const ALL_AREAS = ["Espoo", "Helsinki", "Kirkkonummi", "Klaukkala", "Oulu", "Vantaa"]

interface FilterBarProps {
  selectedArea: string
  onAreaChange: (area: string) => void
  totalCount: number
  activeAreas: string[]  // Areas that have properties
}

export function FilterBar({
  selectedArea,
  onAreaChange,
  totalCount,
  activeAreas,
}: FilterBarProps) {
  const handleAreaClick = (area: string) => {
    if (!activeAreas.includes(area)) return // Don't allow clicking inactive areas
    if (selectedArea === area) {
      onAreaChange("all")
    } else {
      onAreaChange(area)
    }
  }

  return (
    <div className="bg-card rounded-[16px] border border-border/70 shadow-[0_1px_2px_rgba(16,24,40,0.06)] p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Valitse alue">
          {ALL_AREAS.map((area) => {
            const isActive = activeAreas.includes(area)
            const isSelected = selectedArea === area

            return (
              <button
                key={area}
                onClick={() => handleAreaClick(area)}
                disabled={!isActive}
                className={cn(
                  "px-4 py-2 rounded-[12px] text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border",
                  isSelected
                    ? "bg-primary text-primary-foreground border-transparent"
                    : isActive
                      ? "bg-transparent text-foreground border-border/80 hover:bg-secondary"
                      : "bg-transparent text-muted-foreground/50 border-border/40 cursor-default"
                )}
                aria-pressed={isSelected}
                aria-disabled={!isActive}
              >
                {area}
              </button>
            )
          })}
        </div>
        <div className="text-sm" aria-live="polite">
          <span className="font-semibold">{totalCount}</span>
          <span className="text-muted-foreground"> {totalCount === 1 ? "kohde" : "kohdetta"}</span>
        </div>
      </div>
    </div>
  )
}
