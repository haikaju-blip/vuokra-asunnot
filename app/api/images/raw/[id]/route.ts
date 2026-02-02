import { NextResponse } from "next/server"
import { readdir, stat } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const RAW_IMAGES_DIR = "/srv/shared/DROPZONE/vuokra-images-raw"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rawDir = join(RAW_IMAGES_DIR, id)

    if (!existsSync(rawDir)) {
      return NextResponse.json({ images: [] })
    }

    const files = await readdir(rawDir)
    const imageFiles = files.filter(f =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
    )

    const images = await Promise.all(
      imageFiles.map(async (name) => {
        const filePath = join(rawDir, name)
        const fileStat = await stat(filePath)
        return {
          name,
          path: `/api/images/raw/${id}/file/${encodeURIComponent(name)}`,
          size: fileStat.size,
          sizeFormatted: formatSize(fileStat.size)
        }
      })
    )

    // Sort by size descending
    images.sort((a, b) => b.size - a.size)

    return NextResponse.json({ images })
  } catch (error) {
    console.error("Error listing raw images:", error)
    return NextResponse.json({ error: "Failed to list images" }, { status: 500 })
  }
}
