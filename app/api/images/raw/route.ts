import { NextResponse } from "next/server"
import { readdir, stat, readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const RAW_IMAGES_DIR = "/srv/shared/DROPZONE/vuokra-images-raw"

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
          properties.push({
            id: folder,
            imageCount: imageFiles.length,
            address: addressMap.get(folder) || null,
            status: statusMap.get(folder) || null
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
