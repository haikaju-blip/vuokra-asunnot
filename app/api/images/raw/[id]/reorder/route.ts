import { NextResponse } from "next/server"
import { rename } from "fs/promises"
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
    const { order } = await request.json() as { order: string[] }

    if (!Array.isArray(order) || order.length === 0) {
      return NextResponse.json({ error: "Invalid order" }, { status: 400 })
    }

    const rawDir = findFolderForId(id)

    if (!rawDir) {
      return NextResponse.json({ error: "Directory not found" }, { status: 404 })
    }

    // Rename files with numeric prefix
    const renamedFiles: string[] = []

    for (let i = 0; i < order.length; i++) {
      const oldName = order[i]
      const oldPath = join(rawDir, oldName)

      if (!existsSync(oldPath)) {
        continue
      }

      // Remove existing numeric prefix if present
      const baseName = oldName.replace(/^\d+_/, "")
      // Add new prefix (01_, 02_, etc.)
      const prefix = String(i + 1).padStart(2, "0")
      const newName = `${prefix}_${baseName}`
      const newPath = join(rawDir, newName)

      if (oldPath !== newPath) {
        await rename(oldPath, newPath)
        renamedFiles.push(newName)
      } else {
        renamedFiles.push(oldName)
      }
    }

    return NextResponse.json({
      success: true,
      renamed: renamedFiles.length,
      files: renamedFiles
    })
  } catch (error) {
    console.error("Error reordering images:", error)
    return NextResponse.json({ error: "Failed to reorder images" }, { status: 500 })
  }
}
