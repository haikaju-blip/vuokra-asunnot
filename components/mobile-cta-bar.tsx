"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import type { Property } from "@/lib/properties"

interface MobileCTABarProps {
  property: Property
}

export function MobileCTABar({ property }: MobileCTABarProps) {
  const [showOptions, setShowOptions] = useState(false)

  const priceText = property.price > 0
    ? `${property.price.toLocaleString("fi-FI")} €/kk`
    : "Hinta sopimuksen mukaan"

  // TODO: Moltbot-integraatio tähän
  const contactEmail = "asunnot@elea.fi"
  const contactPhone = "+358 40 123 4567"
  const whatsAppNumber = "358401234567"

  return (
    <>
      {/* Overlay for options menu */}
      {showOptions && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setShowOptions(false)}
        />
      )}

      {/* Options menu */}
      {showOptions && (
        <div className="fixed bottom-[72px] left-4 right-4 z-50 lg:hidden">
          <div className="rounded-[16px] border border-border/70 bg-card p-4 shadow-lg space-y-3">
            <p className="text-sm font-medium text-foreground">Muut yhteydenottotavat</p>
            <a
              href={`tel:${contactPhone.replace(/\s/g, "")}`}
              className="flex items-center gap-3 p-3 rounded-[12px] bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span className="text-sm font-medium text-foreground">Soita</span>
            </a>
            <a
              href={`https://wa.me/${whatsAppNumber}?text=Hei, olen kiinnostunut asunnosta: ${property.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-[12px] bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-foreground">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="text-sm font-medium text-foreground">WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Fixed bottom bar - only visible on mobile/tablet */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <div className="border-t border-border/70 bg-card px-4 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
            {/* Price */}
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold text-foreground truncate">{priceText}</p>
              <p className="text-xs text-muted-foreground truncate">{property.name}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowOptions(!showOptions)}
                className="px-3 py-2.5 rounded-[10px] border border-border/70 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              >
                Muut tavat
              </button>
              <a
                href={`mailto:${contactEmail}?subject=Tiedustelu: ${property.name}`}
                className="px-4 py-2.5 rounded-[10px] bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition"
              >
                Ota yhteyttä
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
