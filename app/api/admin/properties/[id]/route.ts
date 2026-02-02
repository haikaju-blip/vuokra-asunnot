import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const DATA_PATH = path.join(process.cwd(), "../../data/properties.json")

interface RawProperty {
  db_id: number
  id: string
  address: string
  city: string
  area_m2: number | null
  rooms: number | null
  floor: number | null
  total_floors?: number | null
  balcony: boolean | null
  rent: number
  landlord: string
  contract_status: string
  status: string
  matterport: string | null
  images: string[]
  public: boolean
  notes: string | null
  year_built?: number | null
  highlights?: string[] | null
  description?: string | null
  available_date?: string | null
}

// Muokattavat kentät
const EDITABLE_FIELDS = [
  "status",
  "rent",
  "area_m2",
  "rooms",
  "floor",
  "total_floors",
  "balcony",
  "description",
  "highlights",
  "public",
  "matterport",
  "available_date",
  "year_built"
] as const

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await fs.readFile(DATA_PATH, "utf-8")
    const properties: RawProperty[] = JSON.parse(data)

    const property = properties.find((p) => p.id === id)

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error("Failed to read property:", error)
    return NextResponse.json({ error: "Failed to load property" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates = await request.json()

    const data = await fs.readFile(DATA_PATH, "utf-8")
    const properties: RawProperty[] = JSON.parse(data)

    const index = properties.findIndex((p) => p.id === id)

    if (index === -1) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Päivitä vain sallitut kentät
    for (const field of EDITABLE_FIELDS) {
      if (field in updates) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (properties[index] as any)[field] = updates[field]
      }
    }

    // Tallenna JSON
    await fs.writeFile(DATA_PATH, JSON.stringify(properties, null, 2), "utf-8")

    return NextResponse.json(properties[index])
  } catch (error) {
    console.error("Failed to update property:", error)
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 })
  }
}
