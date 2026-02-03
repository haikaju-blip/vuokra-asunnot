"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { cn } from "@/lib/utils"
import type { Property } from "@/lib/properties"
import { KeyFactsBar } from "@/components/key-facts-bar"
import { HighlightsPills } from "@/components/highlights-pills"
import { ContactCTACard } from "@/components/contact-cta-card"
import { MobileCTABar } from "@/components/mobile-cta-bar"
import { LocationSection } from "@/components/location-section"
import { FormattedDescription } from "@/components/formatted-description"

// Convert base path to sized image path
function getImageSrc(basePath: string, size: "thumb" | "card" | "large" | "hero" = "hero"): string {
  if (basePath.includes(".") || basePath === "/placeholder.svg") {
    return basePath
  }
  return `${basePath}-${size}.webp`
}

// For property detail page, only use hero image (uncropped)
// Don't use srcSet with card/large because they are cropped to 4:3
function buildHeroSrcSet(basePath: string): string | undefined {
  // Return undefined to disable srcSet - use only the hero image
  return undefined
}

export default function PropertyPage() {
  const params = useParams()
  const id = params?.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showMatterport, setShowMatterport] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Embla carousel for hero gallery
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: false,
  })

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index)
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on("select", onSelect)
    onSelect()

    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi])

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

  const hasMultipleImages = images.length > 1

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
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-3 text-foreground hover:opacity-80">
              <Image
                src="/logo-v4.png"
                alt="ELEA asunnot"
                width={36}
                height={36}
                className="rounded-[8px]"
              />
              <span className="text-lg font-semibold">ELEA asunnot</span>
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Takaisin listaan
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="space-y-6 mb-8">
          {/* Title & Location */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
              {property.name}
            </h1>
            <p className="text-muted-foreground">{property.location}</p>
          </div>

          {/* Hero Image - shows full image without cropping */}
          {images.length > 0 && images[0].src !== "/placeholder.svg" && (
            <div className="rounded-[16px] overflow-hidden border border-border/70 bg-black relative group max-h-[70vh]">
              {hasMultipleImages ? (
                // Swipeable carousel
                <div className="overflow-hidden h-full" ref={emblaRef}>
                  <div className="flex h-full">
                    {images.map((img, i) => (
                      <div key={img.src} className="flex-none w-full min-w-0 flex items-center justify-center">
                        {img.srcSet ? (
                          <img
                            src={img.src}
                            srcSet={img.srcSet}
                            sizes="(min-width: 1024px) 800px, 100vw"
                            alt={`${property.name} ${i + 1}/${images.length}`}
                            className="max-w-full max-h-[70vh] object-contain"
                            loading={i === 0 ? "eager" : "lazy"}
                            decoding="async"
                            draggable={false}
                            {...(i === 0 ? { fetchPriority: "high" } : {})}
                          />
                        ) : (
                          <img
                            src={img.src}
                            alt={`${property.name} ${i + 1}/${images.length}`}
                            className="max-w-full max-h-[70vh] object-contain"
                            loading={i === 0 ? "eager" : "lazy"}
                            decoding="async"
                            draggable={false}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Single image
                <div className="flex items-center justify-center">
                  {images[0].srcSet ? (
                    <img
                      src={images[0].src}
                      srcSet={images[0].srcSet}
                      sizes="(min-width: 1024px) 800px, 100vw"
                      alt={property.name}
                      className="max-w-full max-h-[70vh] object-contain"
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                    />
                  ) : (
                    <img
                      src={images[0].src}
                      alt={property.name}
                      className="max-w-full max-h-[70vh] object-contain"
                      loading="eager"
                      decoding="async"
                    />
                  )}
                </div>
              )}

              {/* Navigation arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={scrollPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center transition-opacity ring-1 ring-black/5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-ring opacity-0 group-hover:opacity-100 sm:opacity-100"
                    aria-label="Edellinen kuva"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={scrollNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center transition-opacity ring-1 ring-black/5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-ring opacity-0 group-hover:opacity-100 sm:opacity-100"
                    aria-label="Seuraava kuva"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Dot indicators */}
              {hasMultipleImages && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-black/40 rounded-full px-3 py-1.5 z-10">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => scrollTo(i)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        i === selectedIndex ? "bg-white" : "bg-white/50 hover:bg-white/70"
                      )}
                      aria-label={`Kuva ${i + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Image counter */}
              {hasMultipleImages && (
                <div className="absolute top-3 right-3 bg-black/50 text-white text-sm px-2.5 py-1 rounded-full backdrop-blur-sm z-10">
                  {selectedIndex + 1} / {images.length}
                </div>
              )}
            </div>
          )}

          {/* Key Facts Bar */}
          <KeyFactsBar property={property} />

          {/* Highlights Pills */}
          <HighlightsPills highlights={property.highlights} />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tablet: CTA card at top (not sticky) */}
            <div className="hidden md:block lg:hidden">
              <ContactCTACard property={property} />
            </div>

            {/* Description */}
            {property.description && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Kuvaus</h2>
                <FormattedDescription text={property.description} />
              </section>
            )}

            {/* 3D Tour */}
            {matterportUrl && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">3D-virtuaalikierros</h2>
                <p className="text-sm text-muted-foreground">
                  Tutustu asuntoon 360°-kierroksella. Voit liikkua tilassa ja tarkastella joka kulmaa.
                </p>
                <div className="rounded-[16px] overflow-hidden border border-border/70 bg-muted aspect-video min-h-[400px] relative">
                  {showMatterport ? (
                    <iframe
                      title={`Matterport 3D-kierros: ${property.name}`}
                      src={`${matterportUrl}&play=1`}
                      allowFullScreen
                      allow="xr-spatial-tracking"
                      className="w-full h-full min-h-[400px]"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowMatterport(true)}
                      className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-4 bg-secondary/50 hover:bg-secondary/70 transition-colors cursor-pointer"
                      aria-label="Avaa 3D-virtuaalikierros"
                    >
                      <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-foreground">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                          <circle cx="12" cy="12" r="4" />
                        </svg>
                      </div>
                      <span className="text-lg font-medium text-foreground">Avaa 3D-virtuaalikierros</span>
                      <span className="text-sm text-muted-foreground">Klikkaa ladataksesi interaktiivisen kierroksen</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  <a href={matterportUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                    Avaa 3D-kierros uuteen välilehteen
                  </a>
                </p>
              </section>
            )}

            {/* Location / Map */}
            <LocationSection
              address={property.address}
              name={property.name}
              location={property.location}
            />
          </div>

          {/* Right Column - Sticky CTA (Desktop only) */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <ContactCTACard property={property} />
            </div>
          </div>
        </div>
      </main>

      {/* Mobile CTA Bar */}
      <MobileCTABar property={property} />
    </div>
  )
}
