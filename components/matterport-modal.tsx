"use client"

import { useEffect, useCallback, useRef } from "react"
import type { Property } from "@/lib/properties"

interface MatterportModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
  onContact: () => void
}

// Rakenna optimoitu Matterport URL
function buildMatterportUrl(baseUrl: string): string {
  // Lisää parametrit: quick start, ei brändäystä, ei apua, autoplay
  const url = new URL(baseUrl)
  url.searchParams.set("qs", "1")      // Quick start - suoraan sisään
  url.searchParams.set("brand", "0")   // Piilota Matterport-brändäys
  url.searchParams.set("help", "0")    // Piilota navigointiohjeet
  url.searchParams.set("play", "1")    // Autoplay
  url.searchParams.set("dh", "0")      // Piilota dollhouse-nappi
  return url.toString()
}

export function MatterportModal({ property, isOpen, onClose, onContact }: MatterportModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  // ESC-näppäin sulkee
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, handleKeyDown])

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), iframe'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener("keydown", handleTabKey)
    return () => document.removeEventListener("keydown", handleTabKey)
  }, [isOpen])

  if (!isOpen || !property || !property.matterportUrl) return null

  const matterportUrl = buildMatterportUrl(property.matterportUrl)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="matterport-modal-title"
    >
      {/* Tumma tausta */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal-sisältö - mobiili pysty: koko näyttö, muut: keskitetty 4:3 */}
      <div
        ref={modalRef}
        className="relative w-full h-full portrait:max-sm:h-full landscape:max-sm:h-auto landscape:max-sm:max-h-[90vh] landscape:max-sm:mx-4 landscape:max-sm:rounded-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-5xl sm:mx-4 bg-white sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Sulje-painike */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
          aria-label="Sulje 3D-kierros"
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Matterport iframe - 4:3 aspect ratio, mobiili pysty: flex-grow */}
        <div className="bg-gray-900 aspect-[4/3] portrait:max-sm:aspect-auto portrait:max-sm:flex-grow portrait:max-sm:min-h-0">
          <iframe
            src={matterportUrl}
            title={`3D-kierros: ${property.name}`}
            className="w-full h-full"
            allowFullScreen
            allow="xr-spatial-tracking"
          />
        </div>

        {/* Kohteen tiedot + CTA - footer */}
        <div className="flex-shrink-0 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-100 bg-white">
          <div className="min-w-0">
            <h2
              id="matterport-modal-title"
              className="text-lg font-semibold text-elea-navy truncate"
            >
              {property.name}
            </h2>
            <p className="text-sm text-elea-text-muted truncate">
              {property.neighborhood ? `${property.neighborhood}, ` : ""}
              {property.location}
              {property.price > 0 && ` · ${property.price.toLocaleString("fi-FI")} €/kk`}
              {property.size > 0 && ` · ${property.size} m²`}
            </p>
          </div>

          <div className="flex gap-2 sm:flex-shrink-0">
            <a
              href={`/kohde/${property.id}`}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg border border-elea-border text-sm font-medium text-elea-navy hover:bg-elea-bg transition-colors text-center"
            >
              Kohteen tiedot
            </a>
            <button
              onClick={() => {
                onClose()
                onContact()
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-elea-navy text-white text-sm font-medium hover:opacity-90 transition-colors whitespace-nowrap"
            >
              Ota yhteyttä
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
