"use client"

import { cn } from "@/lib/utils"
import type { Property } from "@/lib/properties"

interface ContactCTACardProps {
  property: Property
  className?: string
}

export function ContactCTACard({ property, className }: ContactCTACardProps) {
  const priceText = property.price > 0
    ? `${property.price.toLocaleString("fi-FI")} €/kk`
    : "Hinta sopimuksen mukaan"

  const statusText = property.status === "available"
    ? "Vapaa heti"
    : `Vapautuu ${property.availableDate || "pian"}`

  // TODO: Moltbot-integraatio tähän
  const contactEmail = "asunnot@elea.fi"
  const contactPhone = "+358 40 123 4567"

  return (
    <div
      className={cn(
        "rounded-[16px] border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(16,24,40,0.06)]",
        className
      )}
    >
      {/* Hinta */}
      <div className="mb-4">
        <p className="text-2xl font-semibold text-foreground">{priceText}</p>
      </div>

      {/* Status */}
      <div className="mb-6">
        <span
          className={cn(
            "inline-flex items-center px-3 py-1.5 rounded-[10px] text-sm font-medium",
            property.status === "available"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground"
          )}
        >
          {statusText}
        </span>
      </div>

      {/* Faktat */}
      <ul className="mb-6 space-y-2 text-muted-foreground text-sm">
        {property.size > 0 && <li>{property.size} m²</li>}
        {property.rooms > 0 && (
          <li>{property.rooms} {property.rooms === 1 ? "huone" : "huonetta"}</li>
        )}
        <li>{property.location}</li>
      </ul>

      {/* Yhteystiedot */}
      <div className="mb-6 space-y-3">
        <p className="text-sm font-medium text-foreground">Ota yhteyttä</p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <a
            href={`mailto:${contactEmail}?subject=Tiedustelu: ${property.name}`}
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            {contactEmail}
          </a>
          <a
            href={`tel:${contactPhone.replace(/\s/g, "")}`}
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {contactPhone}
          </a>
        </div>
      </div>

      {/* Primary CTA */}
      <a
        href={`mailto:${contactEmail}?subject=Tiedustelu: ${property.name}`}
        className="flex items-center justify-center w-full rounded-[12px] px-4 py-3 bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
      >
        Lähetä tiedustelu
      </a>
    </div>
  )
}
