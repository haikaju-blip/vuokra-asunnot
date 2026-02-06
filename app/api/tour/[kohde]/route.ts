import { NextResponse } from "next/server"
import { loadTourData } from "@/lib/tour-data"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ kohde: string }> }
) {
  try {
    const { kohde } = await params

    // Sanitize kohde name
    if (!/^[a-z0-9-]+$/.test(kohde)) {
      return NextResponse.json({ error: "Virheellinen kohde" }, { status: 400 })
    }

    const tourData = await loadTourData(kohde)
    if (!tourData) {
      return NextResponse.json({ error: "Kohdetta ei löydy" }, { status: 404 })
    }

    // Filter out hidden sweeps for public API
    const visibleSweeps = tourData.sweeps.filter((s) => !s.hidden)

    // Remove hidden sweep references from neighbors
    const hiddenIds = new Set(tourData.sweeps.filter((s) => s.hidden).map((s) => s.id))
    for (const sweep of visibleSweeps) {
      sweep.neighbors = sweep.neighbors.filter((n) => !hiddenIds.has(n))
    }

    return NextResponse.json({
      ...tourData,
      sweeps: visibleSweeps,
    })
  } catch (error) {
    console.error("Tour data error:", error)
    return NextResponse.json({ error: "Palvelinvirhe" }, { status: 500 })
  }
}
