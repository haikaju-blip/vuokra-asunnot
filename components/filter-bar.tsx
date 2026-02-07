"use client"

import { cn } from "@/lib/utils"

const ALL_AREAS = ["Espoo", "Helsinki", "Kirkkonummi", "Klaukkala", "Oulu", "Vantaa"]

interface FilterBarProps {
  selectedArea: string
  onAreaChange: (area: string) => void
  activeAreas: string[]
  onNotifyClick?: () => void
}

export function FilterBar({
  selectedArea,
  onAreaChange,
  activeAreas,
  onNotifyClick,
}: FilterBarProps) {
  const handleAreaClick = (area: string) => {
    if (!activeAreas.includes(area)) return
    if (selectedArea === area) {
      onAreaChange("all")
    } else {
      onAreaChange(area)
    }
  }

  return (
    <div className="bg-card rounded-[16px] border border-border/70 shadow-[0_1px_2px_rgba(16,24,40,0.06)] p-4">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 sm:flex-wrap" role="group" aria-label="Valitse alue">
          {ALL_AREAS.map((area) => {
            const isActive = activeAreas.includes(area)
            const isSelected = selectedArea === area

            return (
              <button
                key={area}
                onClick={() => handleAreaClick(area)}
                disabled={!isActive}
                className={cn(
                  "px-3 py-2 rounded-[12px] text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border sm:px-4",
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

        {/* CTA-box — desktop/tablet */}
        {onNotifyClick && (
          <div className="hidden sm:flex items-center gap-5 bg-elea-warm-pale border border-elea-border rounded-[12px] px-5 py-4 flex-shrink-0">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-elea-text-muted mb-1">Näytämme täällä vain vapaat ja pian vapautuvat.</p>
              <p className="text-[15px] font-semibold text-elea-navy">Etkö löytänyt sopivaa?</p>
              <p className="text-[13px] text-elea-text-muted">Jätä toive — ilmoitamme kun vapautuu.</p>
            </div>
            <button
              onClick={onNotifyClick}
              className="px-5 py-3 bg-elea-navy text-white text-[14px] font-semibold rounded-[10px] whitespace-nowrap transition-colors hover:bg-[#152d47]"
            >
              Ilmoita kiinnostuksesi →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
