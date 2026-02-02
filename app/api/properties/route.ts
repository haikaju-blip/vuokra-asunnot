import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"
import type { Property, RawProperty } from "@/lib/properties"

const DATA_PATH = join(process.cwd(), "..", "..", "data", "properties.json")
const MATTERPORT_BASE = "https://my.matterport.com/show"

function transformProperty(raw: RawProperty): Property {
  const matterportUrl = raw.matterport
    ? `${MATTERPORT_BASE}/?m=${raw.matterport}`
    : undefined

  // Map status: "available" stays, "rented" becomes "upcoming" (or filter out)
  const status = raw.status === "available" ? "available" : "upcoming"

  // Extract name from address (remove postal code)
  const addressParts = raw.address.split(/\s+\d{5}\s+/)
  const name = addressParts[0] || raw.address

  // Build gallery paths from images array
  const gallery = raw.images?.length
    ? raw.images.map((img) => `/images/${raw.db_id}/${img}`)
    : []

  return {
    id: raw.id,
    db_id: raw.db_id,
    name,
    address: raw.address,
    location: raw.city,
    area: raw.city, // Use city as area for now
    image: gallery[0] || "/placeholder.svg",
    size: raw.area_m2 || 0,
    rooms: raw.rooms || 0,
    price: raw.rent || 0,
    status,
    matterportUrl,
    gallery: gallery.length ? gallery : undefined,
    public: raw.public,
  }
}

export async function GET() {
  try {
    const data = readFileSync(DATA_PATH, "utf-8")
    const rawProperties: RawProperty[] = JSON.parse(data)

    // Transform and filter (only public properties, or all for now)
    const properties = rawProperties.map(transformProperty)

    return NextResponse.json(properties)
  } catch (error) {
    console.error("Error reading properties:", error)
    return NextResponse.json({ error: "Failed to load properties" }, { status: 500 })
  }
}
