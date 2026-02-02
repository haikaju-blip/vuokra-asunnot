import { NextResponse } from "next/server"
import { unlink } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

const RAW_IMAGES_DIR = "/srv/shared/DROPZONE/vuokra-images-raw"

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

    const filePath = join(RAW_IMAGES_DIR, id, filename)

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
