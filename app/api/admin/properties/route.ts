import { NextResponse } from "next/server"
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

export async function GET() {
  try {
    const data = await fs.readFile(DATA_PATH, "utf-8")
    const properties: RawProperty[] = JSON.parse(data)

    // Return all properties (including hidden ones) for admin
    const adminList = properties.map((p) => ({
      id: p.id,
      db_id: p.db_id,
      address: p.address,
      city: p.city,
      status: p.status,
      rent: p.rent,
      public: p.public,
      area_m2: p.area_m2,
      rooms: p.rooms
    }))

    return NextResponse.json(adminList)
  } catch (error) {
    console.error("Failed to read properties:", error)
    return NextResponse.json({ error: "Failed to load properties" }, { status: 500 })
  }
}
