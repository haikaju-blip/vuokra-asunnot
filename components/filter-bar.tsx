"use client"

import { cn } from "@/lib/utils"

interface FilterBarProps {
  selectedArea: string
  onAreaChange: (area: string) => void
  selectedTab: "available" | "upcoming"
  onTabChange: (tab: "available" | "upcoming") => void
  availableCount: number
  upcomingCount: number
}

const areas = [
  { id: "all", label: "Kaikki" },
  { id: "area-a", label: "Alue A" },
  { id: "area-b", label: "Alue B" },
]

export function FilterBar({
  selectedArea,
  onAreaChange,
  selectedTab,
  onTabChange,
  availableCount,
  upcomingCount,
}: FilterBarProps) {
  return (
    <div className="bg-card rounded-[16px] border border-border/70 shadow-[0_1px_2px_rgba(16,24,40,0.06)] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-2" role="group" aria-label="Valitse alue">
            {areas.map((area) => (
              <button
                key={area.id}
                onClick={() => onAreaChange(area.id)}
                className={cn(
                  "px-4 py-2 rounded-[12px] text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border",
                  selectedArea === area.id
                    ? "bg-primary text-primary-foreground border-transparent"
                    : "bg-transparent text-foreground border-border/80 hover:bg-secondary"
                )}
                aria-pressed={selectedArea === area.id}
              >
                {area.label}
              </button>
            ))}
          </div>
          <div className="hidden sm:block w-px h-6 bg-border" aria-hidden="true" />
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-[12px] border border-border/70" role="tablist" aria-label="Saatavuus">
            <button
              role="tab"
              aria-selected={selectedTab === "available"}
              onClick={() => onTabChange("available")}
              className={cn(
                "px-4 py-2 rounded-[8px] text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-transparent",
                selectedTab === "available"
                  ? "bg-card text-card-foreground border border-border/70"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Vapaat
            </button>
            <button
              role="tab"
              aria-selected={selectedTab === "upcoming"}
              onClick={() => onTabChange("upcoming")}
              className={cn(
                "px-4 py-2 rounded-[8px] text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-transparent",
                selectedTab === "upcoming"
                  ? "bg-card text-card-foreground border border-border/70"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Vapautuvat
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm" aria-live="polite">
          <span className="text-foreground">
            <span className="font-semibold">{availableCount}</span>
            <span className="text-muted-foreground"> Vapaita</span>
          </span>
          <span className="text-border">/</span>
          <span className="text-foreground">
            <span className="font-semibold">{upcomingCount}</span>
            <span className="text-muted-foreground"> Vapautumassa</span>
          </span>
        </div>
      </div>
    </div>
  )
}
