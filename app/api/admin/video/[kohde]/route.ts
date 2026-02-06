import { NextResponse } from "next/server"
import { readdir, stat, readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const ARCHIVE_BASE = "/opt/vuokra-platform/data/matterport-archive"

interface ImageInfo {
  filename: string
  size: number
  width?: number
  height?: number
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ kohde: string }> }
) {
  try {
    const { kohde } = await params

    if (!/^[a-z0-9-]+$/.test(kohde)) {
      return NextResponse.json({ error: "Virheellinen kohde" }, { status: 400 })
    }

    const imagesDir = join(ARCHIVE_BASE, kohde, "images")
    if (!existsSync(imagesDir)) {
      return NextResponse.json({ error: "Kuvakansiota ei löydy" }, { status: 404 })
    }

    const files = await readdir(imagesDir)
    const images: ImageInfo[] = []

    for (const file of files.sort()) {
      if (!/\.(jpg|jpeg|png|webp)$/i.test(file)) continue
      const filePath = join(imagesDir, file)
      const fileStat = await stat(filePath)
      images.push({
        filename: file,
        size: fileStat.size,
      })
    }

    // Check if video exists
    const webVideoPath = join(ARCHIVE_BASE, kohde, "video", `${kohde}-tour-web.mp4`)
    const hasVideo = existsSync(webVideoPath)
    let videoSize = 0
    if (hasVideo) {
      const vStat = await stat(webVideoPath)
      videoSize = vStat.size
    }

    // Check if selection config exists
    let selectedImages: string[] | null = null
    const configPath = join(ARCHIVE_BASE, kohde, "video-config.json")
    if (existsSync(configPath)) {
      try {
        const raw = await readFile(configPath, "utf-8")
        const config = JSON.parse(raw)
        selectedImages = config.selectedImages || null
      } catch {}
    }

    return NextResponse.json({
      kohde,
      images,
      hasVideo,
      videoSize,
      selectedImages,
    })
  } catch (error) {
    console.error("Video admin error:", error)
    return NextResponse.json({ error: "Palvelinvirhe" }, { status: 500 })
  }
}

// Save selected images config
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ kohde: string }> }
) {
  try {
    const { kohde } = await params

    if (!/^[a-z0-9-]+$/.test(kohde)) {
      return NextResponse.json({ error: "Virheellinen kohde" }, { status: 400 })
    }

    const body = await request.json()
    const { selectedImages } = body as { selectedImages: string[] }

    if (!Array.isArray(selectedImages)) {
      return NextResponse.json({ error: "selectedImages puuttuu" }, { status: 400 })
    }

    const { writeFile } = await import("fs/promises")
    const configPath = join(ARCHIVE_BASE, kohde, "video-config.json")
    await writeFile(configPath, JSON.stringify({ selectedImages }, null, 2), "utf-8")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Video config save error:", error)
    return NextResponse.json({ error: "Palvelinvirhe" }, { status: 500 })
  }
}
