import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { getProperty, getProperties, Property } from "@/lib/properties"
import { PropertyPageClient } from "@/components/property-page-client"

interface PageProps {
  params: Promise<{ id: string }>
}

// JSON-LD Structured Data for property listings (SEO)
function generatePropertyJsonLd(property: Property) {
  const baseUrl = "https://asunnot.elea.fi"
  const imageUrl = property.gallery?.[0]
    ? `${baseUrl}${property.gallery[0]}-large.webp`
    : undefined

  return {
    "@context": "https://schema.org",
    "@type": "Apartment",
    name: property.name,
    description: property.description || `${property.size} m², ${property.rooms} huonetta`,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.name,
      addressLocality: property.location,
      addressCountry: "FI",
    },
    numberOfRooms: property.rooms,
    floorSize: { "@type": "QuantitativeValue", value: property.size, unitCode: "MTK" },
    ...(property.yearBuilt && { yearBuilt: property.yearBuilt }),
    ...(imageUrl && { image: imageUrl }),
    ...(property.matterportUrl && { hasMap: { "@type": "URL", url: property.matterportUrl } }),
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "EUR",
      availability: property.status === "available"
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
    },
    url: `${baseUrl}/kohde/${property.id}`,
  }
}

// Generate static paths for all properties
export async function generateStaticParams() {
  const properties = getProperties()
  return properties.map((property) => ({
    id: property.id,
  }))
}

// Generate dynamic metadata for SEO and social sharing
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const property = getProperty(id)

  if (!property) {
    return {
      title: "Kohdetta ei löytynyt | ELEA asunnot",
    }
  }

  const title = `${property.name} | ELEA asunnot`
  const description = property.description
    ? property.description.slice(0, 160)
    : `${property.size} m² · ${property.rooms} huonetta · ${property.price.toLocaleString("fi-FI")} €/kk – ${property.location}`

  // Use the first gallery image or fallback
  const ogImage = property.gallery?.[0]
    ? `${property.gallery[0]}-large.webp`
    : property.image || "/og-default.png"

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: property.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function PropertyPage({ params }: PageProps) {
  const { id } = await params
  const property = getProperty(id)

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Kohdetta ei löytynyt</h1>
        <Link href="/" className="text-primary hover:underline">
          Takaisin kohteisiin
        </Link>
      </div>
    )
  }

  const jsonLd = generatePropertyJsonLd(property)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PropertyPageClient property={property} />
    </>
  )
}
