import { NextResponse } from "next/server"
import { spawn } from "child_process"
import { join } from "path"
import { existsSync } from "fs"

const ARCHIVE_BASE = "/opt/vuokra-platform/data/matterport-archive"
const SCRIPT_PATH = "/opt/vuokra-platform/scripts/generate-tour-video.sh"

// Track running jobs
const runningJobs = new Map<string, { status: string; output: string; startedAt: number }>()

export async function POST(
  request: Request,
  { params }: { params: Promise<{ kohde: string }> }
) {
  try {
    const { kohde } = await params

    if (!/^[a-z0-9-]+$/.test(kohde)) {
      return NextResponse.json({ error: "Virheellinen kohde" }, { status: 400 })
    }

    const body = await request.json()
    const { images } = body as { images: string[] }

    if (!Array.isArray(images) || images.length < 2) {
      return NextResponse.json({ error: "Tarvitaan vähintään 2 kuvaa" }, { status: 400 })
    }

    // Check if already running
    const existing = runningJobs.get(kohde)
    if (existing && existing.status === "running") {
      return NextResponse.json({
        status: "running",
        message: "Video-generointi on jo käynnissä",
      })
    }

    // Validate all image files exist
    const imagesDir = join(ARCHIVE_BASE, kohde, "images")
    const fullPaths: string[] = []
    for (const filename of images) {
      if (!/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|webp)$/i.test(filename)) {
        return NextResponse.json({ error: `Virheellinen tiedostonimi: ${filename}` }, { status: 400 })
      }
      const fullPath = join(imagesDir, filename)
      if (!existsSync(fullPath)) {
        return NextResponse.json({ error: `Kuvaa ei löydy: ${filename}` }, { status: 404 })
      }
      fullPaths.push(fullPath)
    }

    if (!existsSync(SCRIPT_PATH)) {
      return NextResponse.json({ error: "Generointiskriptiä ei löydy" }, { status: 500 })
    }

    // Start generation
    runningJobs.set(kohde, { status: "running", output: "", startedAt: Date.now() })

    const args = [SCRIPT_PATH, kohde, ...fullPaths]
    const child = spawn("bash", args, { env: { ...process.env } })

    let output = ""

    child.stdout.on("data", (data: Buffer) => {
      output += data.toString()
      const job = runningJobs.get(kohde)
      if (job) job.output = output
    })

    child.stderr.on("data", (data: Buffer) => {
      output += data.toString()
      const job = runningJobs.get(kohde)
      if (job) job.output = output
    })

    child.on("close", (code: number | null) => {
      const job = runningJobs.get(kohde)
      if (job) {
        job.status = code === 0 ? "completed" : "failed"
        job.output = output
      }
    })

    return NextResponse.json({
      status: "started",
      message: `Video-generointi käynnistetty (${images.length} kuvaa)`,
    })
  } catch (error) {
    console.error("Generate error:", error)
    return NextResponse.json({ error: "Palvelinvirhe" }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ kohde: string }> }
) {
  try {
    const { kohde } = await params
    const job = runningJobs.get(kohde)

    if (!job) {
      return NextResponse.json({ status: "idle", output: "" })
    }

    return NextResponse.json({
      status: job.status,
      output: job.output,
    })
  } catch (error) {
    console.error("Generate status error:", error)
    return NextResponse.json({ error: "Palvelinvirhe" }, { status: 500 })
  }
}
