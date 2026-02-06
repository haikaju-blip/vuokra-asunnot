import { NextResponse } from "next/server"
import { loadTourData, loadTourConfig, saveTourConfig, getRawPhotoRooms } from "@/lib/tour-data"
import type { TourConfig } from "@/lib/tour-data"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ kohde: string }> }
) {
  try {
    const { kohde } = await params

    if (!/^[a-z0-9-]+$/.test(kohde)) {
      return NextResponse.json({ error: "Virheellinen kohde" }, { status: 400 })
    }

    const tourData = await loadTourData(kohde)
    if (!tourData) {
      return NextResponse.json({ error: "Kohdetta ei löydy" }, { status: 404 })
    }

    // Include all sweeps (including hidden) for admin
    const rawPhotoRooms = await getRawPhotoRooms(kohde)

    return NextResponse.json({
      ...tourData,
      rawPhotoRooms,
    })
  } catch (error) {
    console.error("Admin tour data error:", error)
    return NextResponse.json({ error: "Palvelinvirhe" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ kohde: string }> }
) {
  try {
    const { kohde } = await params

    if (!/^[a-z0-9-]+$/.test(kohde)) {
      return NextResponse.json({ error: "Virheellinen kohde" }, { status: 400 })
    }

    const body: TourConfig = await request.json()

    // Validate
    if (typeof body.startSweep !== "string") {
      return NextResponse.json({ error: "startSweep puuttuu" }, { status: 400 })
    }
    if (!Array.isArray(body.hiddenSweeps)) {
      return NextResponse.json({ error: "hiddenSweeps puuttuu" }, { status: 400 })
    }
    if (typeof body.sweepLabels !== "object") {
      return NextResponse.json({ error: "sweepLabels puuttuu" }, { status: 400 })
    }

    await saveTourConfig(kohde, {
      startSweep: body.startSweep,
      hiddenSweeps: body.hiddenSweeps,
      sweepLabels: body.sweepLabels,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin tour save error:", error)
    return NextResponse.json({ error: "Palvelinvirhe" }, { status: 500 })
  }
}
