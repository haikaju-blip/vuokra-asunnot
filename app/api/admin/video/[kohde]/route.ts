import { NextResponse } from "next/server"
import { readdir, stat, readFile } from "fs/promises"
import { join } from "path"
import { existsSync, readFileSync } from "fs"

const ARCHIVE_BASE = "/opt/vuokra-platform/data/matterport-archive"
const PROPERTIES_PATH = "/opt/vuokra-platform/data/properties.json"

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
    let overlay = false
    const configPath = join(ARCHIVE_BASE, kohde, "video-config.json")
    if (existsSync(configPath)) {
      try {
        const raw = await readFile(configPath, "utf-8")
        const config = JSON.parse(raw)
        selectedImages = config.selectedImages || null
        overlay = config.overlay === true
      } catch {}
    }

    // Hae kohteen tiedot properties.json:sta
    let propertyData: Record<string, unknown> | null = null
    try {
      const propsRaw = readFileSync(PROPERTIES_PATH, "utf-8")
      const props = JSON.parse(propsRaw) as Array<Record<string, unknown>>
      const match = props.find(
        (p) => p.media_source === kohde || p.id === kohde
      )
      if (match) {
        propertyData = {
          id: match.id,
          rent: match.rent,
          area_m2: match.area_m2,
          rooms: match.rooms,
          room_layout: match.room_layout,
          status: match.status,
          available_date: match.available_date,
          city: match.city,
          neighborhood: match.neighborhood,
        }
      }
    } catch {}

    return NextResponse.json({
      kohde,
      images,
      hasVideo,
      videoSize,
      selectedImages,
      overlay,
      propertyData,
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
    const { selectedImages, overlay } = body as { selectedImages: string[]; overlay?: boolean }

    if (!Array.isArray(selectedImages)) {
      return NextResponse.json({ error: "selectedImages puuttuu" }, { status: 400 })
    }

    const { writeFile } = await import("fs/promises")
    const configPath = join(ARCHIVE_BASE, kohde, "video-config.json")
    await writeFile(configPath, JSON.stringify({
      selectedImages,
      overlay: overlay === true,
    }, null, 2), "utf-8")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Video config save error:", error)
    return NextResponse.json({ error: "Palvelinvirhe" }, { status: 500 })
  }
}
