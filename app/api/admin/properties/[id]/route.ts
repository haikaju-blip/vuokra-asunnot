// app/api/admin/properties/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
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
  neighborhood: string | null
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

function saveProperties(properties: RawProperty[]): boolean {
  try {
    fs.writeFileSync(PROPERTIES_PATH, JSON.stringify(properties, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error('Error writing properties.json:', error)
    return false
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const properties = getRawProperties()
  const property = properties.find(p => p.id === id)

  if (!property) {
    return new NextResponse('Property not found', { status: 404 })
  }

  return NextResponse.json(property)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const properties = getRawProperties()
  const index = properties.findIndex(p => p.id === id)

  if (index === -1) {
    return new NextResponse('Property not found', { status: 404 })
  }

  const updates = await request.json()

  // Update only allowed fields
  const allowedFields = [
    'status', 'public', 'rent', 'area_m2', 'rooms', 'floor', 'total_floors',
    'year_built', 'balcony', 'matterport', 'available_date', 'neighborhood',
    'highlights', 'description', 'notes'
  ]

  for (const field of allowedFields) {
    if (field in updates) {
      (properties[index] as any)[field] = updates[field]
    }
  }

  if (saveProperties(properties)) {
    return NextResponse.json({ success: true, property: properties[index] })
  } else {
    return new NextResponse('Failed to save', { status: 500 })
  }
}
