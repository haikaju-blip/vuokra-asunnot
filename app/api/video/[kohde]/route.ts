import { NextResponse, NextRequest } from "next/server"
import { stat, open } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const ARCHIVE_BASE = "/opt/vuokra-platform/data/matterport-archive"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kohde: string }> }
) {
  try {
    const { kohde } = await params

    if (!/^[a-z0-9-]+$/.test(kohde)) {
      return NextResponse.json({ error: "Virheellinen kohde" }, { status: 400 })
    }

    const videoPath = join(ARCHIVE_BASE, kohde, "video", `${kohde}-tour-web.mp4`)
    if (!existsSync(videoPath)) {
      return NextResponse.json({ error: "Videota ei löydy" }, { status: 404 })
    }

    const fileStat = await stat(videoPath)
    const fileSize = fileStat.size

    // Support range requests for video seeking
    const range = request.headers.get("range")

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
      const chunkSize = end - start + 1

      const fileHandle = await open(videoPath, "r")
      const buffer = Buffer.alloc(chunkSize)
      await fileHandle.read(buffer, 0, chunkSize, start)
      await fileHandle.close()

      return new NextResponse(buffer, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(chunkSize),
          "Content-Type": "video/mp4",
          "Cache-Control": "public, max-age=3600",
        },
      })
    }

    // Full file response
    const fileHandle = await open(videoPath, "r")
    const buffer = Buffer.alloc(fileSize)
    await fileHandle.read(buffer, 0, fileSize, 0)
    await fileHandle.close()

    const isDownload = request.nextUrl.searchParams.get("download") === "1"

    const headers: Record<string, string> = {
      "Content-Length": String(fileSize),
      "Content-Type": "video/mp4",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=3600",
    }

    if (isDownload) {
      headers["Content-Disposition"] = `attachment; filename="${kohde}-videokierros.mp4"`
    }

    return new NextResponse(buffer, { headers })
  } catch (error) {
    console.error("Video serve error:", error)
    return NextResponse.json({ error: "Palvelinvirhe" }, { status: 500 })
  }
}
