import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

interface RawProperty {
  db_id: number
  id: string
  address: string
  city: string
  area_m2: number | null
  rooms: string | null
  rent: number | null
  master_id: string | null
}

// Extract street name and building number from address
// "Isokatu 60 B18 90100 Oulu" -> "Isokatu 60"
function extractStreetAndBuilding(address: string): string {
  // Match street name + building number (before apartment letter/number)
  const match = address.match(/^(.+?\s+\d+)\s+[A-Za-z]?\d+/)
  if (match) {
    return match[1].toLowerCase()
  }
  // Fallback: first two words
  const parts = address.split(" ")
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`.toLowerCase()
  }
  return address.toLowerCase()
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const targetId = parseInt(id)

    const dataPath = join(process.cwd(), "..", "..", "data", "properties.json")
    const data = await readFile(dataPath, "utf-8")
    const properties: RawProperty[] = JSON.parse(data)

    // Find target property
    const target = properties.find(p => p.db_id === targetId)
    if (!target) {
      return NextResponse.json({ related: [] })
    }

    const targetStreet = extractStreetAndBuilding(target.address)

    // Find related properties (same street + building, different apartment)
    const related = properties
      .filter(p => {
        if (p.db_id === targetId) return false
        const street = extractStreetAndBuilding(p.address)
        return street === targetStreet
      })
      .map(p => ({
        id: p.id,
        db_id: p.db_id,
        name: p.id, // Use slug as name
        address: p.address,
        city: p.city,
        size: p.area_m2,
        rooms: p.rooms,
        rent: p.rent,
        master_id: p.master_id || null
      }))

    return NextResponse.json({
      target: {
        id: String(target.db_id),
        db_id: target.db_id,
        name: target.id,
        address: target.address,
        streetBuilding: targetStreet
      },
      related
    })
  } catch (error) {
    console.error("Error finding related properties:", error)
    return NextResponse.json({ related: [] })
  }
}
