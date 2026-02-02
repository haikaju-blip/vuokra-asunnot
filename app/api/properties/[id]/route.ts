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

  const status = raw.status === "available" ? "available" : "upcoming"

  const addressParts = raw.address.split(/\s+\d{5}\s+/)
  const name = addressParts[0] || raw.address

  const gallery = raw.images?.length
    ? raw.images.map((img) => `/images/${raw.db_id}/${img}`)
    : []

  return {
    id: raw.id,
    db_id: raw.db_id,
    name,
    address: raw.address,
    location: raw.city,
    area: raw.city,
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
