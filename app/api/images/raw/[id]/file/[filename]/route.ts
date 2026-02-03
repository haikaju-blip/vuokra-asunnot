import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync, readdirSync } from "fs"

const RAW_IMAGES_DIR = "/srv/shared/DROPZONE/vuokra-images-raw"

// Etsi kansio joka alkaa db_id:llä
function findFolderForId(id: string): string | null {
  if (!existsSync(RAW_IMAGES_DIR)) return null
  const folders = readdirSync(RAW_IMAGES_DIR)
  if (folders.includes(id)) return join(RAW_IMAGES_DIR, id)
  const match = folders.find(f => f.startsWith(`${id} - `) || f.startsWith(`${id} -`))
  if (match) return join(RAW_IMAGES_DIR, match)
  return null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; filename: string }> }
) {
  try {
    const { id, filename } = await params
    const decodedFilename = decodeURIComponent(filename)

    const rawDir = findFolderForId(id)
    if (!rawDir) {
      return NextResponse.json({ error: "Directory not found" }, { status: 404 })
    }

    const filePath = join(rawDir, decodedFilename)

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const fileBuffer = await readFile(filePath)

    // Determine content type
    const ext = decodedFilename.toLowerCase().split('.').pop()
    const contentTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp"
    }

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentTypes[ext || "jpg"] || "image/jpeg",
        "Cache-Control": "public, max-age=3600"
      }
    })
  } catch (error) {
    console.error("Error serving image:", error)
    return NextResponse.json({ error: "Failed to serve image" }, { status: 500 })
  }
}
