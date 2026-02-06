import { NextResponse, NextRequest } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { getKohdeDir, SKYBOX_FACE_MAP } from "@/lib/tour-data"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kohde: string }> }
) {
  try {
    const { kohde } = await params
    const searchParams = request.nextUrl.searchParams

    // Sanitize kohde
    if (!/^[a-z0-9-]+$/.test(kohde)) {
      return NextResponse.json({ error: "Virheellinen kohde" }, { status: 400 })
    }

    const kohdeDir = getKohdeDir(kohde)
    if (!existsSync(kohdeDir)) {
      return NextResponse.json({ error: "Kohdetta ei löydy" }, { status: 404 })
    }

    // Matterport cubemap: ?scan={id}&face={0-5}&res=2k
    const scanId = searchParams.get("scan")
    const face = searchParams.get("face")
    const res = searchParams.get("res") || "2k"

    if (scanId && face !== null) {
      // Validate scan ID (hex string)
      if (!/^[a-f0-9]+$/.test(scanId)) {
        return NextResponse.json({ error: "Virheellinen scan ID" }, { status: 400 })
      }

      const faceNum = parseInt(face, 10)
      if (isNaN(faceNum) || faceNum < 0 || faceNum > 5) {
        return NextResponse.json({ error: "Virheellinen face (0-5)" }, { status: 400 })
      }

      // Validate resolution
      const validRes = ["low", "2k", "4k", "high"]
      if (!validRes.includes(res)) {
        return NextResponse.json({ error: "Virheellinen resoluutio" }, { status: 400 })
      }

      const filePath = join(kohdeDir, "panoramas", res, `${scanId}_skybox${faceNum}.jpg`)

      if (!existsSync(filePath)) {
        return NextResponse.json({ error: "Kuvaa ei löydy" }, { status: 404 })
      }

      const data = await readFile(filePath)
      return new NextResponse(data, {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      })
    }

    // Own panorama: ?file=eteinen.jpg
    const file = searchParams.get("file")
    if (file) {
      // Sanitize filename - only allow alphanumeric, hyphens, underscores, dots
      if (!/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/i.test(file)) {
        return NextResponse.json({ error: "Virheellinen tiedostonimi" }, { status: 400 })
      }

      const filePath = join(kohdeDir, "own-panoramas", file)
      if (!existsSync(filePath)) {
        return NextResponse.json({ error: "Kuvaa ei löydy" }, { status: 404 })
      }

      const data = await readFile(filePath)
      const ext = file.split(".").pop()?.toLowerCase()
      const contentType =
        ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg"

      return new NextResponse(data, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      })
    }

    return NextResponse.json({ error: "Puuttuvat parametrit (scan+face tai file)" }, { status: 400 })
  } catch (error) {
    console.error("Panorama serve error:", error)
    return NextResponse.json({ error: "Palvelinvirhe" }, { status: 500 })
  }
}
