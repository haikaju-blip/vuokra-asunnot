"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { Property } from "@/lib/properties"

interface PropertyCardProps {
  property: Property
}

const ROTATE_INTERVAL_MS = 3000

// Convert base path to sized image path
// /images/38/01 -> /images/38/01-large.webp
function getImageSrc(basePath: string, size: "thumb" | "card" | "large" | "hero" = "large"): string {
  if (basePath.includes(".") || basePath === "/placeholder.svg") {
    return basePath // Already has extension or is placeholder
  }
  return `${basePath}-${size}.webp`
}

export function PropertyCard({ property }: PropertyCardProps) {
  const isAvailable = property.status === "available"
  const href = `/kohde/${property.id}`
  // Gallery contains base paths, we add size suffix
  const baseImages = property.gallery?.length ? property.gallery : []
  const images = baseImages.length
    ? baseImages.map(base => getImageSrc(base, "large"))
    : [property.image || "/placeholder.svg"]
  const [currentIndex, setCurrentIndex] = useState(0)
  const hasRotation = images.length > 1

  useEffect(() => {
    if (!hasRotation) return
    const t = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % images.length)
    }, ROTATE_INTERVAL_MS)
    return () => clearInterval(t)
  }, [hasRotation, images.length])

  return (
    <Link
      href={href}
      aria-label={`Katso kohde: ${property.name}`}
      className="block rounded-[16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <article className="group bg-card rounded-[16px] overflow-hidden border border-border/70 shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition duration-300 hover:shadow-[0_8px_20px_rgba(16,24,40,0.10)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {images.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={`${property.name} ${i + 1}/${images.length}`}
              fill
              className={cn(
                "object-cover transition-opacity duration-500",
                i === currentIndex ? "opacity-100 z-0" : "opacity-0 z-0"
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ))}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span
              className={cn(
                "inline-flex items-center px-3 py-1.5 rounded-[10px] text-sm font-medium backdrop-blur-md ring-1 ring-black/5",
                isAvailable ? "bg-primary text-primary-foreground" : "bg-white/85 text-foreground"
              )}
            >
              {isAvailable ? "Vapaa" : `Vapautuu ${property.availableDate}`}
            </span>
            {property.matterportUrl && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-sm font-medium bg-white/90 text-foreground backdrop-blur-md ring-1 ring-black/5">
                <span aria-hidden>360°</span> 3D-kierros
              </span>
            )}
          </div>
          {hasRotation && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    i === currentIndex ? "bg-primary-foreground" : "bg-white/60"
                  )}
                  aria-hidden
                />
              ))}
            </div>
          )}
        </div>
        <div className="p-5 space-y-3">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-card-foreground leading-tight text-balance">
              {property.name}
            </h3>
            <p className="text-[13px] text-muted-foreground">
              {property.location} · {property.area}
            </p>
          </div>
          <p className="text-[13px] text-muted-foreground">
            <span className="font-semibold text-foreground">
              {property.price.toLocaleString("fi-FI")} €/kk
            </span>
            <span className="mx-2 text-border">·</span>
            {property.size} m²
            <span className="mx-2 text-border">·</span>
            {property.rooms} {property.rooms === 1 ? "huone" : "huonetta"}
          </p>
          <div className="pt-1">
            <span className="inline-flex items-center justify-center rounded-[12px] px-4 py-2 text-[13px] font-medium border border-border/80 bg-card hover:bg-secondary transition">
              Katso kohde <span className="ml-2" aria-hidden="true">→</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
