import { NextResponse } from "next/server"
import { readdir, stat, readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const RAW_IMAGES_DIR = "/srv/shared/DROPZONE/vuokra-images-raw"

// Pura db_id kansion nimestä (esim. "5 - Kauppalinnankatu 1 J85" → "5")
function extractDbId(folderName: string): string {
  const match = folderName.match(/^(\d+)/)
  return match ? match[1] : folderName
}

interface PropertyWithImages {
  id: string
  imageCount: number
  address: string | null
  status: string | null
}

interface RawProperty {
  db_id: number
  address: string
  status: string
}

export async function GET() {
  try {
    if (!existsSync(RAW_IMAGES_DIR)) {
      return NextResponse.json({ properties: [] })
    }

    // Load property data for addresses
    const dataPath = join(process.cwd(), "..", "..", "data", "properties.json")
    let propertyData: RawProperty[] = []
    try {
      const data = await readFile(dataPath, "utf-8")
      propertyData = JSON.parse(data)
    } catch {}

    const addressMap = new Map<string, string>()
    const statusMap = new Map<string, string>()
    for (const p of propertyData) {
      addressMap.set(String(p.db_id), p.address)
      statusMap.set(String(p.db_id), p.status)
    }

    const folders = await readdir(RAW_IMAGES_DIR)
    const properties: PropertyWithImages[] = []

    for (const folder of folders) {
      const folderPath = join(RAW_IMAGES_DIR, folder)
      const folderStat = await stat(folderPath)

      if (folderStat.isDirectory()) {
        const files = await readdir(folderPath)
        const imageFiles = files.filter(f =>
          /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
        )

        if (imageFiles.length > 0) {
          const dbId = extractDbId(folder)
          properties.push({
            id: dbId,
            imageCount: imageFiles.length,
            address: addressMap.get(dbId) || null,
            status: statusMap.get(dbId) || null
          })
        }
      }
    }

    // Sort by id numerically
    properties.sort((a, b) => parseInt(a.id) - parseInt(b.id))

    return NextResponse.json({ properties })
  } catch (error) {
    console.error("Error listing properties with raw images:", error)
    return NextResponse.json({ properties: [] })
  }
}
