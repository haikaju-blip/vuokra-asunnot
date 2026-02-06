"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import type { TourData, TourSweep, TourConfig, RawPhotoRoom } from "@/lib/tour-data"

interface AdminTourData extends TourData {
  rawPhotoRooms: RawPhotoRoom[]
}

interface StitchStatus {
  status: "idle" | "running" | "completed" | "failed"
  output: string
}

export default function AdminTourPage({
  params,
}: {
  params: Promise<{ kohde: string }>
}) {
  const [kohde, setKohde] = useState<string>("")
  const [tourData, setTourData] = useState<AdminTourData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  // Editable config state
  const [startSweep, setStartSweep] = useState("")
  const [hiddenSweeps, setHiddenSweeps] = useState<Set<string>>(new Set())
  const [sweepLabels, setSweepLabels] = useState<Record<string, string>>({})

  // Stitching status
  const [stitchStatuses, setStitchStatuses] = useState<Record<string, StitchStatus>>({})

  // Resolve params
  useEffect(() => {
    params.then((p) => setKohde(p.kohde))
  }, [params])

  // Load data
  useEffect(() => {
    if (!kohde) return
    fetch(`/api/admin/tour/${kohde}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then((data: AdminTourData) => {
        setTourData(data)
        setStartSweep(data.config.startSweep)
        setHiddenSweeps(new Set(data.config.hiddenSweeps))
        setSweepLabels(data.config.sweepLabels)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [kohde])

  // Save config
  const handleSave = useCallback(async () => {
    if (!kohde) return
    setSaving(true)
    try {
      const config: TourConfig = {
        startSweep,
        hiddenSweeps: Array.from(hiddenSweeps),
        sweepLabels,
      }
      const res = await fetch(`/api/admin/tour/${kohde}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      if (res.ok) {
        setDirty(false)
      }
    } catch (e) {
      console.error("Save failed:", e)
    }
    setSaving(false)
  }, [kohde, startSweep, hiddenSweeps, sweepLabels])

  // Keyboard shortcut: Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        if (dirty) handleSave()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [dirty, handleSave])

  // Toggle sweep visibility
  const toggleSweep = (id: string) => {
    const next = new Set(hiddenSweeps)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setHiddenSweeps(next)
    setDirty(true)
  }

  // Update label
  const updateLabel = (id: string, label: string) => {
    setSweepLabels((prev) => ({ ...prev, [id]: label }))
    setDirty(true)
  }

  // Set start sweep
  const selectStart = (id: string) => {
    setStartSweep(id)
    setDirty(true)
  }

  // Start stitching
  const startStitch = async (room: string) => {
    if (!kohde) return
    setStitchStatuses((prev) => ({
      ...prev,
      [room]: { status: "running", output: "Käynnistetään..." },
    }))

    try {
      const res = await fetch(`/api/admin/tour/${kohde}/stitch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room }),
      })
      const data = await res.json()

      if (data.status === "started" || data.status === "running") {
        // Poll for status
        pollStitchStatus(room)
      } else {
        setStitchStatuses((prev) => ({
          ...prev,
          [room]: { status: "failed", output: data.error || "Virhe" },
        }))
      }
    } catch {
      setStitchStatuses((prev) => ({
        ...prev,
        [room]: { status: "failed", output: "Yhteysvirhe" },
      }))
    }
  }

  // Poll stitch status
  const pollStitchStatus = (room: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/tour/${kohde}/stitch?room=${room}`)
        const data = await res.json()
        setStitchStatuses((prev) => ({
          ...prev,
          [room]: { status: data.status, output: data.output || "" },
        }))

        if (data.status !== "running") {
          clearInterval(interval)
        }
      } catch {
        clearInterval(interval)
      }
    }, 2000)
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-elea-text-muted">Ladataan...</p>
      </div>
    )
  }

  if (!tourData || tourData.sweeps.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold text-elea-navy mb-2">
          360° kierros — {kohde}
        </h1>
        <p className="text-elea-text-muted">
          Kohdetta ei löydy tai panoraamapisteitä ei ole.
        </p>
        <p className="text-sm text-elea-text-light mt-2">
          Varmista, että <code className="text-xs bg-secondary px-1 py-0.5 rounded">/srv/shared/DROPZONE/{kohde}/</code>{" "}
          sisältää <code className="text-xs bg-secondary px-1 py-0.5 rounded">space-data.json</code> tai{" "}
          <code className="text-xs bg-secondary px-1 py-0.5 rounded">own-panoramas/</code> -kansion.
        </p>
      </div>
    )
  }

  const visibleCount = tourData.sweeps.filter((s) => !hiddenSweeps.has(s.id)).length

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-elea-navy flex items-center gap-2">
            360° kierros — {tourData.name}
            {dirty && <span className="w-2.5 h-2.5 rounded-full bg-blue-500" title="Tallentamattomia muutoksia" />}
          </h1>
          <p className="text-sm text-elea-text-muted mt-1">
            {tourData.sweeps.length} pistettä, {visibleCount} näkyvää
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/tour/${kohde}`}
            target="_blank"
            className="px-3 py-2 rounded-lg border border-elea-border text-elea-navy text-sm hover:bg-secondary transition"
          >
            Avaa kierros →
          </Link>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              dirty
                ? "bg-elea-navy text-white hover:opacity-90"
                : "bg-secondary text-elea-text-muted cursor-not-allowed"
            }`}
          >
            {saving ? "Tallennetaan..." : "Tallenna"}
          </button>
        </div>
      </div>

      {/* Sweep grid */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-elea-navy uppercase tracking-wide mb-3">
          Panoraamapisteet
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {tourData.sweeps.map((sweep) => {
            const isHidden = hiddenSweeps.has(sweep.id)
            const isStart = startSweep === sweep.id
            const label = sweepLabels[sweep.id] || sweep.label

            return (
              <div
                key={sweep.id}
                className={`rounded-xl border p-3 transition ${
                  isHidden
                    ? "border-border/50 bg-secondary/50 opacity-60"
                    : isStart
                      ? "border-elea-warm bg-elea-warm-pale/30"
                      : "border-elea-border bg-card"
                }`}
              >
                {/* Thumbnail */}
                <div className="aspect-[16/9] rounded-lg bg-secondary mb-2 overflow-hidden relative">
                  {sweep.type === "cubemap" && sweep.scanId ? (
                    <img
                      src={`/api/tour/${kohde}/panorama?scan=${sweep.scanId}&res=low&face=1`}
                      alt={label}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : sweep.panoramaFile ? (
                    <img
                      src={`/api/tour/${kohde}/panorama?file=${sweep.panoramaFile}`}
                      alt={label}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-elea-text-light text-xs">
                      Ei kuvaa
                    </div>
                  )}
                  {/* Index badge */}
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white">
                    #{sweep.index + 1}
                  </span>
                  {/* Type badge */}
                  <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] bg-black/60 text-white">
                    {sweep.type === "cubemap" ? "Cubemap" : "Equirect"}
                  </span>
                </div>

                {/* Label input */}
                <input
                  type="text"
                  value={label}
                  onChange={(e) => updateLabel(sweep.id, e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg border border-elea-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-elea-navy/20 focus:border-elea-navy transition mb-2"
                  placeholder="Huoneen nimi"
                />

                {/* Controls */}
                <div className="flex items-center justify-between">
                  {/* Visibility toggle */}
                  <button
                    onClick={() => toggleSweep(sweep.id)}
                    className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded transition ${
                      isHidden
                        ? "text-elea-text-light hover:text-elea-navy"
                        : "text-green-600 hover:text-green-700"
                    }`}
                  >
                    {isHidden ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                        Piilotettu
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Näkyvä
                      </>
                    )}
                  </button>

                  {/* Start point radio */}
                  <button
                    onClick={() => selectStart(sweep.id)}
                    className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded transition ${
                      isStart
                        ? "text-elea-warm font-medium"
                        : "text-elea-text-light hover:text-elea-navy"
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                        isStart ? "border-elea-warm" : "border-elea-border"
                      }`}
                    >
                      {isStart && <span className="w-1.5 h-1.5 rounded-full bg-elea-warm" />}
                    </span>
                    Aloitus
                  </button>
                </div>

                {/* Neighbors info */}
                <div className="mt-2 text-[10px] text-elea-text-light">
                  {sweep.neighbors.length} naapuria
                  {sweep.neighbors.length > 0 && (
                    <span className="ml-1">
                      ({sweep.neighbors
                        .map((nId) => {
                          const n = tourData.sweeps.find((s) => s.id === nId)
                          return n ? `#${n.index + 1}` : "?"
                        })
                        .join(", ")})
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Raw photos & stitching */}
      {tourData.rawPhotoRooms && tourData.rawPhotoRooms.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-elea-navy uppercase tracking-wide mb-3">
            Raakakuvat ja stitching
          </h2>
          <div className="space-y-2">
            {tourData.rawPhotoRooms.map((room) => {
              const status = stitchStatuses[room.name]
              const isRunning = status?.status === "running"

              return (
                <div
                  key={room.name}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border border-elea-border bg-card"
                >
                  <div>
                    <span className="text-sm font-medium text-elea-navy">
                      {room.name}
                    </span>
                    <span className="text-xs text-elea-text-muted ml-2">
                      {room.imageCount} kuvaa
                    </span>
                    {room.hasStitchedResult && (
                      <span className="text-xs text-green-600 ml-2">Panoraama valmiina</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Status */}
                    {status?.status === "completed" && (
                      <span className="text-xs text-green-600">Valmis</span>
                    )}
                    {status?.status === "failed" && (
                      <span className="text-xs text-red-500">Virhe</span>
                    )}
                    {isRunning && (
                      <div className="w-4 h-4 border-2 border-elea-warm border-t-transparent rounded-full animate-spin" />
                    )}

                    {/* Stitch button */}
                    <button
                      onClick={() => startStitch(room.name)}
                      disabled={isRunning}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        isRunning
                          ? "bg-secondary text-elea-text-muted cursor-not-allowed"
                          : "bg-elea-navy text-white hover:opacity-90"
                      }`}
                    >
                      {isRunning ? "Yhdistetään..." : room.hasStitchedResult ? "Yhdistä uudelleen" : "Yhdistä panoraama"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
