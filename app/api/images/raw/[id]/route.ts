import { NextResponse } from "next/server"
import { readdir, stat } from "fs/promises"
import { join } from "path"
import { existsSync, readdirSync } from "fs"

const RAW_IMAGES_DIR = "/srv/shared/DROPZONE/vuokra-images-raw"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Etsi kansio joka alkaa db_id:llä (esim. "5" tai "5 - Osoite")
function findFolderForId(id: string): string | null {
  if (!existsSync(RAW_IMAGES_DIR)) return null
  const folders = readdirSync(RAW_IMAGES_DIR)
  // Ensin yritä täsmällistä hakua
  if (folders.includes(id)) return join(RAW_IMAGES_DIR, id)
  // Sitten etsi "id - " alkuinen
  const match = folders.find(f => f.startsWith(`${id} - `) || f.startsWith(`${id} -`))
  if (match) return join(RAW_IMAGES_DIR, match)
  return null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rawDir = findFolderForId(id)

    if (!rawDir) {
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

    // Sort by numeric prefix (01_, 02_, etc.), then alphabetically
    images.sort((a, b) => {
      const aMatch = a.name.match(/^(\d+)_/)
      const bMatch = b.name.match(/^(\d+)_/)
      const aNum = aMatch ? parseInt(aMatch[1], 10) : 999
      const bNum = bMatch ? parseInt(bMatch[1], 10) : 999
      if (aNum !== bNum) return aNum - bNum
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json({ images })
  } catch (error) {
    console.error("Error listing raw images:", error)
    return NextResponse.json({ error: "Failed to list images" }, { status: 500 })
  }
}
