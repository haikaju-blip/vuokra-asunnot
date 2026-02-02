// app/api/admin/properties/route.ts
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface RawProperty {
  db_id: number
  id: string
  address: string
  city: string
  area_m2: number | null
  rooms: number | null
  floor: number | null
  total_floors: number | null
  balcony: boolean | null
  rent: number
  landlord: string
  contract_status: string
  status: string
  matterport: string | null
  images: string[]
  public: boolean
  notes: string | null
  year_built: number | null
  highlights: string[] | null
  description: string | null
  available_date: string | null
}

const PROPERTIES_PATH = path.join(process.cwd(), '..', '..', 'data', 'properties.json')

function getRawProperties(): RawProperty[] {
  try {
    const data = fs.readFileSync(PROPERTIES_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading properties.json:', error)
    return []
  }
}

export async function GET() {
  const properties = getRawProperties()

  // Return all properties for admin (including non-public)
  const adminProperties = properties.map(p => ({
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

  return NextResponse.json(adminProperties)
}
