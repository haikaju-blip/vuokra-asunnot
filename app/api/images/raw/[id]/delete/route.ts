import { NextResponse } from "next/server"
import { unlink } from "fs/promises"
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { filename } = body

    if (!filename) {
      return NextResponse.json({ error: "Missing filename" }, { status: 400 })
    }

    const rawDir = findFolderForId(id)
    if (!rawDir) {
      return NextResponse.json({ error: "Directory not found" }, { status: 404 })
    }

    const filePath = join(rawDir, filename)

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    await unlink(filePath)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting image:", error)
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 })
  }
}
