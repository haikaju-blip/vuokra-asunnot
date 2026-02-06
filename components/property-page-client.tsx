"use client"

import Link from "next/link"
import { useState, useCallback, useEffect } from "react"
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

interface PropertyPageClientProps {
  property: Property
}

export function PropertyPageClient({ property }: PropertyPageClientProps) {
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

  // Use hero-sized images for property detail page
  const baseImages = property.gallery?.length ? property.gallery : []
  const images = baseImages.length
    ? baseImages.map(base => ({
        src: getImageSrc(base, "hero"),
      }))
    : property.image ? [{ src: property.image }] : []

  const hasMultipleImages = images.length > 1
  const matterportUrl = property.matterportUrl
  const videoUrl = property.videoUrl

  return (
    <div className="min-h-screen pb-24 lg:pb-0 bg-elea-bg">
      {/* Header */}
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E5DFD6' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-baseline" style={{ marginLeft: 31 }}>
              <span
                className="font-serif"
                style={{ fontSize: 26, color: '#1B3A5C', letterSpacing: '-0.3px' }}
              >
                ELEA<span style={{ color: '#C8A96E' }}>.</span>
              </span>
            </Link>
            <Link
              href="/"
              className="hover:opacity-70 transition-opacity"
              style={{ fontSize: 15, color: '#6B6560' }}
            >
              ← Takaisin
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-6 py-8">
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
                        <img
                          src={img.src}
                          alt={`${property.name} ${i + 1}/${images.length}`}
                          className="max-w-full max-h-[70vh] object-contain"
                          loading={i === 0 ? "eager" : "lazy"}
                          decoding="async"
                          draggable={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Single image
                <div className="flex items-center justify-center">
                  <img
                    src={images[0].src}
                    alt={property.name}
                    className="max-w-full max-h-[70vh] object-contain"
                    loading="eager"
                    decoding="async"
                  />
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

            {/* Virtual Tour Section */}
            {(videoUrl || matterportUrl) && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Virtuaalikierros</h2>
                <p className="text-sm text-muted-foreground">
                  Tutustu asuntoon videokierroksella tai interaktiivisella 3D-kierroksella.
                </p>

                {/* Video tour */}
                {videoUrl && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Videokierros</h3>
                      <a
                        href={`${videoUrl}?download=1`}
                        download
                        className="text-xs text-elea-text-muted hover:text-elea-navy transition flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
                        </svg>
                        Lataa video
                      </a>
                    </div>
                    <div className="rounded-[16px] overflow-hidden border border-border/70 bg-black aspect-video relative">
                      <video
                        src={videoUrl}
                        controls
                        playsInline
                        preload="metadata"
                        poster=""
                        className="w-full h-full object-contain"
                      >
                        Selaimesi ei tue videotoistoa.
                      </video>
                    </div>
                  </div>
                )}

                {/* Matterport 3D */}
                {matterportUrl && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">3D-kierros</h3>
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
                          <span className="text-lg font-medium text-foreground">Avaa 3D-kierros</span>
                          <span className="text-sm text-muted-foreground">Klikkaa ladataksesi interaktiivisen kierroksen</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <a href={matterportUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                        Avaa 3D-kierros uuteen välilehteen
                      </a>
                    </p>
                  </div>
                )}
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
