"use client"

import Link from "next/link"
import Image from "next/image"
import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { cn } from "@/lib/utils"
import type { Property } from "@/lib/properties"
import { MatterportModal } from "./matterport-modal"

interface PropertyCardProps {
  property: Property
  onContactClick?: (property: Property) => void
}

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

// Strip apartment number from address (e.g., "Niittyportti 2 A13" → "Niittyportti 2")
function getStreetName(fullName: string): string {
  return fullName.replace(/\s+[A-Z]\s*\d+.*$/, "").trim()
}

export function PropertyCard({ property, onContactClick }: PropertyCardProps) {
  const isAvailable = property.status === "available"
  const href = `/kohde/${property.id}`

  // Gallery contains base paths
  const baseImages = property.gallery?.length ? property.gallery : []
  const images = baseImages.length
    ? baseImages.map(base => ({
        src: getImageSrc(base, "large"),
        srcSet: buildSrcSet(base),
        base
      }))
    : [{ src: property.image || "/placeholder.svg", srcSet: undefined, base: "" }]

  const hasMultipleImages = images.length > 1

  // Embla carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: false,
  })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [matterportOpen, setMatterportOpen] = useState(false)

  const scrollPrev = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    emblaApi?.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    emblaApi?.scrollTo(index)
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    const onPointerDown = () => {
      setIsDragging(false)
    }

    const onScroll = () => {
      // If scrolling, we're dragging
      setIsDragging(true)
    }

    const onSettle = () => {
      // Reset after scroll settles
      setTimeout(() => setIsDragging(false), 100)
    }

    emblaApi.on("select", onSelect)
    emblaApi.on("pointerDown", onPointerDown)
    emblaApi.on("scroll", onScroll)
    emblaApi.on("settle", onSettle)
    onSelect()

    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("pointerDown", onPointerDown)
      emblaApi.off("scroll", onScroll)
      emblaApi.off("settle", onSettle)
    }
  }, [emblaApi])

  // Prevent navigation when dragging/swiping
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault()
    }
  }, [isDragging])

  return (
    <>
    <Link
      href={href}
      aria-label={`Katso kohde: ${property.name}`}
      onClick={handleClick}
      className="block rounded-[16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <article
        className="group bg-card rounded-[16px] overflow-hidden border border-border/70 shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition duration-300 hover:shadow-[0_8px_20px_rgba(16,24,40,0.10)]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {hasMultipleImages ? (
            // Swipeable carousel for multiple images
            <div className="overflow-hidden h-full" ref={emblaRef}>
              <div className="flex h-full">
                {images.map((img, i) => (
                  <div key={img.src} className="flex-none w-full h-full min-w-0">
                    {img.srcSet ? (
                      <img
                        src={img.src}
                        srcSet={img.srcSet}
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        alt={`${property.name} ${i + 1}/${images.length}`}
                        className="w-full h-full object-cover"
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                        draggable={false}
                      />
                    ) : (
                      <Image
                        src={img.src}
                        alt={`${property.name} ${i + 1}/${images.length}`}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        draggable={false}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Single image - no carousel needed
            images[0].srcSet ? (
              <img
                src={images[0].src}
                srcSet={images[0].srcSet}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                alt={property.name}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
            ) : (
              <Image
                src={images[0].src}
                alt={property.name}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            )
          )}

          {/* Status badge */}
          <div className="absolute top-3 left-3 z-10">
            <span
              className="inline-flex items-center px-3 py-1.5 rounded-[10px] text-sm font-medium backdrop-blur-md ring-1 ring-black/5 bg-primary text-primary-foreground"
            >
              {isAvailable ? "Vapaa" : `Vapaa ${property.availableDate}`}
            </span>
          </div>

          {/* 3D badge - kultainen glow ring, avaa Matterport-modalin */}
          {property.matterportUrl && (
            <div className="absolute top-3 right-3 z-10">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setMatterportOpen(true)
                }}
                className="badge-3d w-9 h-9 rounded-full bg-elea-warm flex items-center justify-center text-[11px] font-bold text-white transition-transform duration-150 hover:scale-110 focus-visible:outline-2 focus-visible:outline-elea-warm focus-visible:outline-offset-2"
                aria-label={`Avaa 3D-kierros: ${property.name}`}
              >
                3D
              </button>
            </div>
          )}

          {/* Navigation arrows - desktop only, on hover */}
          {hasMultipleImages && (
            <>
              <button
                onClick={scrollPrev}
                className={cn(
                  "absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center transition-opacity ring-1 ring-black/5",
                  "hover:bg-white focus:outline-none focus:ring-2 focus:ring-ring",
                  isHovered ? "opacity-100" : "opacity-0",
                  "hidden sm:flex"
                )}
                aria-label="Edellinen kuva"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={scrollNext}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center transition-opacity ring-1 ring-black/5",
                  "hover:bg-white focus:outline-none focus:ring-2 focus:ring-ring",
                  isHovered ? "opacity-100" : "opacity-0",
                  "hidden sm:flex"
                )}
                aria-label="Seuraava kuva"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Dot indicators */}
          {hasMultipleImages && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => scrollTo(i, e)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all focus:outline-none",
                    i === selectedIndex
                      ? "bg-white scale-110"
                      : "bg-white/50 hover:bg-white/70"
                  )}
                  aria-label={`Kuva ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-5 space-y-3">
          <div className="space-y-1">
            {/* Otsikkorivi: nimi + CTA */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-card-foreground leading-tight text-balance">
                {getStreetName(property.name)}
              </h3>
              {onContactClick && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onContactClick(property)
                  }}
                  className="
                    text-xs font-medium shrink-0
                    text-elea-navy bg-transparent
                    px-3 py-1.5
                    border border-elea-border rounded-lg
                    transition-all duration-150
                    hover:bg-elea-navy hover:border-elea-navy hover:text-white
                    focus-visible:outline-2 focus-visible:outline-elea-navy focus-visible:outline-offset-2
                  "
                  aria-label={`Ota yhteyttä kohteesta ${property.name}`}
                >
                  Ota yhteyttä
                </button>
              )}
            </div>
            <p className="text-[13px] text-muted-foreground">
              {property.neighborhood ? `${property.neighborhood}, ${property.location}` : property.location}
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
              if (property.roomLayout) {
                parts.push(<span key="rooms">{property.roomLayout}</span>)
              } else if (property.rooms > 0) {
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
          <div className="min-h-[52px]">
            {property.highlights && property.highlights.length > 0 ? (
              <div className="flex flex-wrap gap-1 max-h-[52px] overflow-hidden items-start content-start">
                {property.highlights.slice(0, 5).map((h, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-[6px] bg-secondary text-[11px] text-muted-foreground"
                  >
                    {h}
                  </span>
                ))}
                {property.highlights.length > 5 && (
                  <span className="px-2 py-0.5 rounded-[6px] bg-secondary/50 text-[11px] text-muted-foreground">
                    +{property.highlights.length - 5}
                  </span>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </article>
    </Link>

    {/* Matterport Modal */}
    <MatterportModal
      property={property}
      isOpen={matterportOpen}
      onClose={() => setMatterportOpen(false)}
      onContact={() => {
        setMatterportOpen(false)
        onContactClick?.(property)
      }}
    />
  </>
  )
}
