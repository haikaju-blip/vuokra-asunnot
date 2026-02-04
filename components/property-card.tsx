import Link from "next/link"
import Image from "next/image"
import type { Property } from "@/lib/properties"

interface PropertyCardProps {
  property: Property
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

export function PropertyCard({ property }: PropertyCardProps) {
  const isAvailable = property.status === "available"
  const href = `/kohde/${property.id}`

  // Get first image only (carousel is on detail page)
  const baseImages = property.gallery?.length ? property.gallery : []
  const firstImage = baseImages.length
    ? { src: getImageSrc(baseImages[0], "large"), srcSet: buildSrcSet(baseImages[0]) }
    : { src: property.image || "/placeholder.svg", srcSet: undefined }

  const imageCount = baseImages.length || 1

  return (
    <Link
      href={href}
      aria-label={`Katso kohde: ${property.name}`}
      className="block rounded-[16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <article className="group bg-card rounded-[16px] overflow-hidden border border-border/70 shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition duration-300 hover:shadow-[0_8px_20px_rgba(16,24,40,0.10)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {/* Single image - no carousel */}
          {firstImage.srcSet ? (
            <img
              src={firstImage.src}
              srcSet={firstImage.srcSet}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              alt={property.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <Image
              src={firstImage.src}
              alt={property.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
          )}

          {/* Status badge */}
          <div className="absolute top-3 left-3 z-10">
            <span
              className="inline-flex items-center px-3 py-1.5 rounded-[10px] text-sm font-medium backdrop-blur-md ring-1 ring-black/5 bg-primary text-primary-foreground"
            >
              {isAvailable ? "Vapaa" : `Vapaa ${property.availableDate}`}
            </span>
          </div>

          {/* 3D badge */}
          {property.matterportUrl && (
            <div className="absolute top-3 right-3 z-10">
              <span
                className="inline-flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold bg-white/90 text-foreground backdrop-blur-md ring-1 ring-black/5"
                aria-label="3D-kierros saatavilla"
              >
                3D
              </span>
            </div>
          )}

          {/* Image count badge (if multiple images) */}
          {imageCount > 1 && (
            <div className="absolute bottom-3 right-3 z-10">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {imageCount}
              </span>
            </div>
          )}
        </div>

        <div className="p-5 space-y-3 overflow-hidden">
          <div className="space-y-1">
            <h3 className="text-[16px] leading-tight break-words font-serif text-elea-navy">
              {property.name}
            </h3>
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
          {property.highlights && property.highlights.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {property.highlights.slice(0, 4).map((h, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-[6px] bg-secondary text-[11px] text-muted-foreground"
                >
                  {h}
                </span>
              ))}
              {property.highlights.length > 4 && (
                <span className="px-2 py-0.5 text-[11px] text-muted-foreground">
                  +{property.highlights.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}
