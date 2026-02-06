import { NextResponse, NextRequest } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const ARCHIVE_BASE = "/opt/vuokra-platform/data/matterport-archive"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kohde: string }> }
) {
  try {
    const { kohde } = await params
    const filename = request.nextUrl.searchParams.get("file")

    if (!/^[a-z0-9-]+$/.test(kohde)) {
      return NextResponse.json({ error: "Virheellinen kohde" }, { status: 400 })
    }

    if (!filename || !/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i.test(filename)) {
      return NextResponse.json({ error: "Virheellinen tiedostonimi" }, { status: 400 })
    }

    const filePath = join(ARCHIVE_BASE, kohde, "images", filename)
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Kuvaa ei löydy" }, { status: 404 })
    }

    // Serve original image (browser handles resizing via CSS)
    const data = await readFile(filePath)
    return new NextResponse(data, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (error) {
    console.error("Thumbnail error:", error)
    return NextResponse.json({ error: "Palvelinvirhe" }, { status: 500 })
  }
}
