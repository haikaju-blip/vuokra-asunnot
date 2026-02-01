"use client"

import { useParams, notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { allProperties } from "@/lib/properties"
import { cn } from "@/lib/utils"

const ROTATE_INTERVAL_MS = 4000

export default function PropertyPage() {
  const params = useParams()
  const id = params?.id as string
  const property = allProperties.find((p) => p.id === id)
  const images = property?.gallery?.length ? property.gallery : property ? [property.image] : []
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const t = setInterval(() => {
      setCurrentImageIndex((i) => (i + 1) % images.length)
    }, ROTATE_INTERVAL_MS)
    return () => clearInterval(t)
  }, [images.length])

  if (!property) notFound()

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
              <span className="text-lg font-semibold">Kohteet</span>
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
              {property.location} · {property.area}
            </p>

            {/* Pyörivä kuvagalleria */}
            {images.length > 0 && (
              <div className="rounded-[16px] overflow-hidden border border-border/70 bg-muted aspect-video relative">
                {images.map((src, i) => (
                  <Image
                    key={src}
                    src={src}
                    alt={`${property.name} ${i + 1}/${images.length}`}
                    fill
                    className={cn(
                      "object-cover transition-opacity duration-500",
                      i === currentImageIndex ? "opacity-100" : "opacity-0"
                    )}
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    unoptimized
                    priority
                  />
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

            {/* Matterport 3D-kierros embed */}
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
                  {property.status === "available" ? "Vapaa" : `Vapautuu ${property.availableDate}`}
                </span>
                {matterportUrl && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-[10px] text-sm font-medium bg-secondary text-foreground">
                    360° 3D-kierros
                  </span>
                )}
              </div>
              <p className="text-2xl font-semibold text-foreground">
                {property.price.toLocaleString("fi-FI")} €/kk
              </p>
              <ul className="mt-4 space-y-2 text-muted-foreground">
                <li>{property.size} m²</li>
                <li>{property.rooms} {property.rooms === 1 ? "huone" : "huonetta"}</li>
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
