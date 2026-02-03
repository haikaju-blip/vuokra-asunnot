import { NextResponse } from "next/server"
import { readFileSync, existsSync, readdirSync } from "fs"
import { join } from "path"
import type { Property, RawProperty } from "@/lib/properties"

const DATA_PATH = join(process.cwd(), "..", "..", "data", "properties.json")
const IMAGES_DIR = join(process.cwd(), "public", "images")
const MATTERPORT_BASE = "https://my.matterport.com/show"

// Scan processed images folder and return base names (without size suffix)
function getProcessedImages(dbId: number): string[] {
  const folder = join(IMAGES_DIR, String(dbId))
  if (!existsSync(folder)) return []

  try {
    const files = readdirSync(folder)
    // Find unique base names from files like "01-large.webp", "01-card.webp"
    const baseNames = new Set<string>()
    for (const file of files) {
      const match = file.match(/^(\d+)-\w+\.webp$/)
      if (match) {
        baseNames.add(match[1])
      }
    }
    // Return sorted base names
    return Array.from(baseNames).sort()
  } catch {
    return []
  }
}

// Format date as "28.2.26" (d.M.yy)
function formatAvailableDate(isoDate: string | null | undefined): string | undefined {
  if (!isoDate) return undefined
  try {
    const date = new Date(isoDate)
    const day = date.getDate()
    const month = date.getMonth() + 1
    const year = String(date.getFullYear()).slice(-2)
    return `${day}.${month}.${year}`
  } catch {
    return undefined
  }
}

function transformProperty(raw: RawProperty): Property {
  const matterportUrl = raw.matterport
    ? `${MATTERPORT_BASE}/?m=${raw.matterport}`
    : undefined

  // Map status: "available" stays, "rented" becomes "upcoming" (or filter out)
  const status = raw.status === "available" ? "available" : "upcoming"

  // Format available date for display
  const availableDate = formatAvailableDate(raw.available_date)

  // Extract name from address (remove postal code)
  const addressParts = raw.address.split(/\s+\d{5}\s+/)
  const name = addressParts[0] || raw.address

  // Get processed images (base names like "01", "02")
  const processedImages = getProcessedImages(raw.db_id)

  // Build gallery with base paths (component adds size suffix)
  // Format: /images/{db_id}/{base} - component appends -large.webp etc
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
    availableDate,
    neighborhood: raw.neighborhood || undefined,
    matterportUrl,
    gallery: gallery.length ? gallery : undefined,
    public: raw.public,
    highlights: raw.highlights || undefined,
  }
}

export async function GET() {
  try {
    const data = readFileSync(DATA_PATH, "utf-8")
    const rawProperties: RawProperty[] = JSON.parse(data)

    // Transform and filter - only public properties
    const properties = rawProperties
      .filter(p => p.public === true)
      .map(transformProperty)

    return NextResponse.json(properties)
  } catch (error) {
    console.error("Error reading properties:", error)
    return NextResponse.json({ error: "Failed to load properties" }, { status: 500 })
  }
}
