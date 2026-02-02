"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { Property } from "@/lib/properties"

const ROTATE_INTERVAL_MS = 4000

// Convert base path to sized image path
function getImageSrc(basePath: string, size: "thumb" | "card" | "large" | "hero" = "hero"): string {
  if (basePath.includes(".") || basePath === "/placeholder.svg") {
    return basePath
  }
  return `${basePath}-${size}.webp`
}

// Build srcSet for hero images (large + hero for different screens)
function buildHeroSrcSet(basePath: string): string | undefined {
  if (basePath.includes(".") || basePath === "/placeholder.svg") {
    return undefined
  }
  return [
    `${basePath}-card.webp 1200w`,
    `${basePath}-large.webp 1600w`,
    `${basePath}-hero.webp 2400w`,
  ].join(", ")
}

export default function PropertyPage() {
  const params = useParams()
  const id = params?.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (!id) return
    fetch(`/api/properties/${id}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true)
          setLoading(false)
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (data) {
          setProperty(data)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load property:", err)
        setLoading(false)
      })
  }, [id])

  // Use hero-sized images for property detail page
  const baseImages = property?.gallery?.length ? property.gallery : []
  const images = baseImages.length
    ? baseImages.map(base => ({
        src: getImageSrc(base, "hero"),
        srcSet: buildHeroSrcSet(base)
      }))
    : property?.image ? [{ src: property.image, srcSet: undefined }] : []

  useEffect(() => {
    if (images.length <= 1) return
    const t = setInterval(() => {
      setCurrentImageIndex((i) => (i + 1) % images.length)
    }, ROTATE_INTERVAL_MS)
    return () => clearInterval(t)
  }, [images.length])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Ladataan kohdetta...</div>
      </div>
    )
  }

  if (notFound || !property) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Kohdetta ei löytynyt</h1>
        <Link href="/" className="text-primary hover:underline">
          Takaisin kohteisiin
        </Link>
      </div>
    )
  }

  const matterportUrl = property.matterportUrl

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-foreground hover:opacity-80">
              <div className="w-8 h-8 rounded-[8px] bg-primary flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-foreground">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span className="text-lg font-semibold">Vuokra-asunnot</span>
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Takaisin listaan
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
              {property.name}
            </h1>
            <p className="text-muted-foreground">
              {property.location}
            </p>

            {images.length > 0 && images[0].src !== "/placeholder.svg" && (
              <div className="rounded-[16px] overflow-hidden border border-border/70 bg-muted aspect-video relative">
                {images.map((img, i) => (
                  img.srcSet ? (
                    <img
                      key={img.src}
                      src={img.src}
                      srcSet={img.srcSet}
                      sizes="(min-width: 1024px) 800px, 100vw"
                      alt={`${property.name} ${i + 1}/${images.length}`}
                      className={cn(
                        "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
                        i === currentImageIndex ? "opacity-100" : "opacity-0"
                      )}
                      loading={i === 0 ? "eager" : "lazy"}
                    />
                  ) : (
                    <Image
                      key={img.src}
                      src={img.src}
                      alt={`${property.name} ${i + 1}/${images.length}`}
                      fill
                      className={cn(
                        "object-cover transition-opacity duration-500",
                        i === currentImageIndex ? "opacity-100" : "opacity-0"
                      )}
                      sizes="(min-width: 1024px) 800px, 100vw"
                      priority={i === 0}
                    />
                  )
                ))}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 rounded-full px-3 py-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentImageIndex(i)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-colors",
                          i === currentImageIndex ? "bg-white" : "bg-white/50"
                        )}
                        aria-label={`Kuva ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {matterportUrl && (
              <section className="space-y-3">
                <h2 className="text-xl font-semibold text-foreground">3D-virtuaalikierros (Matterport)</h2>
                <p className="text-sm text-muted-foreground">
                  Tutustu asuntoon 360°-kierroksella. Voit liikkua tilassa ja tarkastella joka kulmaa.
                </p>
                <div className="rounded-[16px] overflow-hidden border border-border/70 bg-muted aspect-video min-h-[400px]">
                  <iframe
                    title={`Matterport 3D-kierros: ${property.name}`}
                    src={`${matterportUrl}&play=1`}
                    allowFullScreen
                    allow="xr-spatial-tracking"
                    className="w-full h-full min-h-[400px]"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  <a href={matterportUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                    Avaa 3D-kierros uuteen välilehteen
                  </a>
                </p>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-[16px] border border-border/70 bg-card p-6 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={cn(
                    "inline-flex items-center px-3 py-1.5 rounded-[10px] text-sm font-medium",
                    property.status === "available" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  )}
                >
                  {property.status === "available" ? "Vapaa" : `Vapautuu ${property.availableDate || "pian"}`}
                </span>
                {matterportUrl && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-[10px] text-sm font-medium bg-secondary text-foreground">
                    360° 3D-kierros
                  </span>
                )}
              </div>
              <p className="text-2xl font-semibold text-foreground">
                {property.price > 0 ? `${property.price.toLocaleString("fi-FI")} €/kk` : "Hinta sopimuksen mukaan"}
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                {property.size > 0 && <li>{property.size} m²</li>}
                {property.rooms > 0 && <li>{property.rooms} {property.rooms === 1 ? "huone" : "huonetta"}</li>}
                <li>{property.location}</li>
              </ul>
              <Link
                href="/"
                className="mt-6 inline-flex items-center justify-center w-full rounded-[12px] px-4 py-3 bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
              >
                Takaisin kohteisiin
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
