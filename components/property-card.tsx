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
function getImageSrc(basePath: string, size: "thumb" | "card" | "large" | "hero" = "large"): string {
  if (basePath.includes(".") || basePath === "/placeholder.svg") {
    return basePath
  }
  return `${basePath}-${size}.webp`
}

// Build srcSet for responsive loading
function buildSrcSet(basePath: string): string | undefined {
  if (basePath.includes(".") || basePath === "/placeholder.svg") {
    return undefined
  }
  return [
    `${basePath}-thumb.webp 800w`,
    `${basePath}-card.webp 1200w`,
    `${basePath}-large.webp 1600w`,
  ].join(", ")
}

export function PropertyCard({ property }: PropertyCardProps) {
  const isAvailable = property.status === "available"
  const href = `/kohde/${property.id}`
  // Gallery contains base paths
  const baseImages = property.gallery?.length ? property.gallery : []
  const hasProcessedImages = baseImages.length > 0 && !baseImages[0].includes(".")
  const images = baseImages.length
    ? baseImages.map(base => ({
        src: getImageSrc(base, "large"),
        srcSet: buildSrcSet(base),
        base
      }))
    : [{ src: property.image || "/placeholder.svg", srcSet: undefined, base: "" }]
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
          {images.map((img, i) => (
            img.srcSet ? (
              // Use native img with srcSet for pre-generated responsive images
              <img
                key={img.src}
                src={img.src}
                srcSet={img.srcSet}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                alt={`${property.name} ${i + 1}/${images.length}`}
                className={cn(
                  "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
                  i === currentIndex ? "opacity-100 z-0" : "opacity-0 z-0"
                )}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            ) : (
              // Fallback to Next/Image for non-processed images
              <Image
                key={img.src}
                src={img.src}
                alt={`${property.name} ${i + 1}/${images.length}`}
                fill
                className={cn(
                  "object-cover transition-opacity duration-500",
                  i === currentIndex ? "opacity-100 z-0" : "opacity-0 z-0"
                )}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            )
          ))}
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                "inline-flex items-center px-3 py-1.5 rounded-[10px] text-sm font-medium backdrop-blur-md ring-1 ring-black/5",
                isAvailable ? "bg-primary text-primary-foreground" : "bg-white/85 text-foreground"
              )}
            >
              {isAvailable ? "Vapaa" : `Vapaa ${property.availableDate}`}
            </span>
          </div>
          {property.matterportUrl && (
            <div className="absolute top-3 right-3">
              <span
                className="inline-flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold bg-white/90 text-foreground backdrop-blur-md ring-1 ring-black/5"
                aria-label="3D-kierros saatavilla"
              >
                3D
              </span>
            </div>
          )}
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
              {property.location}
            </p>
          </div>
          <p className="text-[13px] text-muted-foreground">
            {(() => {
              const parts: React.ReactNode[] = []
              if (property.price > 0) {
                parts.push(
                  <span key="price" className="font-semibold text-foreground">
                    {property.price.toLocaleString("fi-FI")} €/kk
                  </span>
                )
              }
              if (property.size > 0) {
                parts.push(<span key="size">{property.size} m²</span>)
              }
              if (property.rooms > 0) {
                parts.push(
                  <span key="rooms">
                    {property.rooms} {property.rooms === 1 ? "huone" : "huonetta"}
                  </span>
                )
              }
              if (parts.length === 0) {
                return <span>Tiedot tulossa</span>
              }
              return parts.reduce<React.ReactNode[]>((acc, part, i) => {
                if (i > 0) acc.push(<span key={`sep-${i}`} className="mx-2 text-muted-foreground">·</span>)
                acc.push(part)
                return acc
              }, [])
            })()}
          </p>
        </div>
      </article>
    </Link>
  )
}
