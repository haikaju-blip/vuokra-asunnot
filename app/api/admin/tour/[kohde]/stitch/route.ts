import { NextResponse } from "next/server"
import { spawn } from "child_process"
import { join } from "path"
import { existsSync } from "fs"
import { readdir } from "fs/promises"
import { getKohdeDir } from "@/lib/tour-data"

// Track running stitch jobs
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
    const room = body.room as string

    if (!room || !/^[a-zA-Z0-9_-]+$/.test(room)) {
      return NextResponse.json({ error: "Virheellinen huoneen nimi" }, { status: 400 })
    }

    const kohdeDir = getKohdeDir(kohde)
    const inputDir = join(kohdeDir, "raw-photos", room)
    const outputDir = join(kohdeDir, "own-panoramas")
    const outputFile = join(outputDir, `${room}.jpg`)

    if (!existsSync(inputDir)) {
      return NextResponse.json({ error: "Raakakuvakansiota ei löydy" }, { status: 404 })
    }

    const jobKey = `${kohde}/${room}`

    // Check if already running
    const existing = runningJobs.get(jobKey)
    if (existing && existing.status === "running") {
      return NextResponse.json({
        status: "running",
        message: "Stitching on jo käynnissä",
      })
    }

    // Start stitching in background
    const scriptPath = join(process.cwd(), "..", "..", "scripts", "stitch-panorama.sh")

    if (!existsSync(scriptPath)) {
      return NextResponse.json({ error: "Stitching-skriptiä ei löydy" }, { status: 500 })
    }

    runningJobs.set(jobKey, { status: "running", output: "", startedAt: Date.now() })

    const child = spawn("bash", [scriptPath, inputDir, outputFile], {
      env: { ...process.env },
    })

    let output = ""

    child.stdout.on("data", (data: Buffer) => {
      output += data.toString()
      const job = runningJobs.get(jobKey)
      if (job) job.output = output
    })

    child.stderr.on("data", (data: Buffer) => {
      output += data.toString()
      const job = runningJobs.get(jobKey)
      if (job) job.output = output
    })

    child.on("close", (code: number | null) => {
      const job = runningJobs.get(jobKey)
      if (job) {
        job.status = code === 0 ? "completed" : "failed"
        job.output = output
      }
    })

    return NextResponse.json({
      status: "started",
      message: "Stitching käynnistetty",
    })
  } catch (error) {
    console.error("Stitch error:", error)
    return NextResponse.json({ error: "Palvelinvirhe" }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ kohde: string }> }
) {
  try {
    const { kohde } = await params
    const url = new URL(request.url)
    const room = url.searchParams.get("room")

    if (!room) {
      return NextResponse.json({ error: "room-parametri puuttuu" }, { status: 400 })
    }

    const jobKey = `${kohde}/${room}`
    const job = runningJobs.get(jobKey)

    if (!job) {
      // Check if result file exists
      const kohdeDir = getKohdeDir(kohde)
      const outputFile = join(kohdeDir, "own-panoramas", `${room}.jpg`)
      if (existsSync(outputFile)) {
        return NextResponse.json({ status: "completed", output: "Panoraama on jo valmiina." })
      }
      return NextResponse.json({ status: "idle", output: "" })
    }

    return NextResponse.json({
      status: job.status,
      output: job.output,
    })
  } catch (error) {
    console.error("Stitch status error:", error)
    return NextResponse.json({ error: "Palvelinvirhe" }, { status: 500 })
  }
}
