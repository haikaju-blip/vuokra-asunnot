import { NextResponse } from "next/server"
import { readFileSync, readdirSync, existsSync } from "fs"
import { join } from "path"
import type { Property, RawProperty } from "@/lib/properties"

const DATA_PATH = join(process.cwd(), "..", "..", "data", "properties.json")
const IMAGES_DIR = join(process.cwd(), "public", "images")
const MATTERPORT_BASE = "https://my.matterport.com/show"

// Hae kuvat kansiosta (WebP-muodossa)
function getProcessedImages(dbId: number): string[] {
  const dir = join(IMAGES_DIR, String(dbId))
  if (!existsSync(dir)) return []

  try {
    const files = readdirSync(dir)
    // Hae uniikit base-nimet (01, 02, jne.)
    const baseNames = new Set<string>()
    for (const file of files) {
      const match = file.match(/^(\d+)-\w+\.webp$/)
      if (match) {
        baseNames.add(match[1])
      }
    }
    return Array.from(baseNames).sort()
  } catch {
    return []
  }
}

function transformProperty(raw: RawProperty): Property {
  const matterportUrl = raw.matterport
    ? `${MATTERPORT_BASE}/?m=${raw.matterport}`
    : undefined

  const status = raw.status === "available" ? "available" : "upcoming"

  const addressParts = raw.address.split(/\s+\d{5}\s+/)
  const name = addressParts[0] || raw.address

  // Hae kuvat levyltä (WebP base-nimet)
  const processedImages = getProcessedImages(raw.db_id)
  // Muodosta gallery base-poluista
  const gallery = processedImages.map(base => `/images/${raw.db_id}/${base}`)

  return {
    id: raw.id,
    db_id: raw.db_id,
    name,
    address: raw.address,
    location: raw.city,
    area: raw.city,
    image: gallery[0] ? `${gallery[0]}-large.webp` : "/placeholder.svg",
    size: raw.area_m2 || 0,
    rooms: raw.rooms || 0,
    price: raw.rent || 0,
    status,
    matterportUrl,
    gallery: gallery.length ? gallery : undefined,
    public: raw.public,
    // Kohdesivun lisäkentät
    floor: raw.floor ?? undefined,
    totalFloors: raw.total_floors ?? undefined,
    balcony: raw.balcony ?? undefined,
    yearBuilt: raw.year_built ?? undefined,
    highlights: raw.highlights ?? undefined,
    description: raw.description ?? undefined,
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = readFileSync(DATA_PATH, "utf-8")
    const rawProperties: RawProperty[] = JSON.parse(data)

    const rawProperty = rawProperties.find((p) => p.id === id)

    if (!rawProperty) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    const property = transformProperty(rawProperty)
    return NextResponse.json(property)
  } catch (error) {
    console.error("Error reading property:", error)
    return NextResponse.json({ error: "Failed to load property" }, { status: 500 })
  }
}
