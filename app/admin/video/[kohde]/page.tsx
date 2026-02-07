"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"

interface ImageInfo {
  filename: string
  size: number
}

interface PropertyData {
  id: string
  rent: number
  area_m2: number | null
  rooms: number | null
  room_layout: string | null
  status: string
  available_date: string | null
  city: string
  neighborhood: string | null
}

interface VideoData {
  kohde: string
  images: ImageInfo[]
  hasVideo: boolean
  videoSize: number
  selectedImages: string[] | null
  overlay: boolean
  propertyData: PropertyData | null
}

export default function AdminVideoPage({
  params,
}: {
  params: Promise<{ kohde: string }>
}) {
  const [kohde, setKohde] = useState("")
  const [allImages, setAllImages] = useState<ImageInfo[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasVideo, setHasVideo] = useState(false)
  const [videoSize, setVideoSize] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [genOutput, setGenOutput] = useState("")
  const [genStatus, setGenStatus] = useState<"idle" | "running" | "completed" | "failed">("idle")
  const [dirty, setDirty] = useState(false)
  const [overlay, setOverlay] = useState(false)
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null)

  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Resolve params
  useEffect(() => {
    params.then((p) => setKohde(p.kohde))
  }, [params])

  // Load data
  useEffect(() => {
    if (!kohde) return
    fetch(`/api/admin/video/${kohde}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then((data: VideoData) => {
        setAllImages(data.images)
        setHasVideo(data.hasVideo)
        setVideoSize(data.videoSize)
        setOverlay(data.overlay || false)
        setPropertyData(data.propertyData || null)
        // If saved selection exists, use it; otherwise select all
        if (data.selectedImages && data.selectedImages.length > 0) {
          setSelected(data.selectedImages)
        } else {
          setSelected(data.images.map((img) => img.filename))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [kohde])

  // Toggle image selection
  const toggleImage = (filename: string) => {
    setSelected((prev) => {
      if (prev.includes(filename)) {
        return prev.filter((f) => f !== filename)
      } else {
        return [...prev, filename]
      }
    })
    setDirty(true)
  }

  // Select all / none
  const selectAll = () => {
    setSelected(allImages.map((img) => img.filename))
    setDirty(true)
  }
  const selectNone = () => {
    setSelected([])
    setDirty(true)
  }

  // Drag & drop handlers for reordering selected images
  const handleDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }

    setSelected((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(dropIndex, 0, moved)
      return next
    })
    setDragIndex(null)
    setDragOverIndex(null)
    setDirty(true)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  // Save selection + property data
  const handleSave = async () => {
    if (!kohde) return
    setSaving(true)
    try {
      // Tallenna video-asetukset + kohteen tiedot yhdellä kutsulla
      await fetch(`/api/admin/video/${kohde}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedImages: selected,
          overlay,
          propertyData: propertyData ? {
            _propertyId: propertyData.id,
            rent: propertyData.rent,
            area_m2: propertyData.area_m2,
            rooms: propertyData.rooms,
            room_layout: propertyData.room_layout,
            status: propertyData.status,
            available_date: propertyData.available_date,
            neighborhood: propertyData.neighborhood,
            city: propertyData.city,
          } : undefined,
        }),
      })

      setDirty(false)
    } catch (e) {
      console.error("Save failed:", e)
    }
    setSaving(false)
  }

  // Generate video
  const handleGenerate = async () => {
    if (!kohde || selected.length < 2) return
    setGenerating(true)
    setGenStatus("running")
    setGenOutput("Käynnistetään...")

    // Save selection + property data first
    const propPayload = propertyData ? {
      _propertyId: propertyData.id,
      rent: propertyData.rent,
      area_m2: propertyData.area_m2,
      rooms: propertyData.rooms,
      room_layout: propertyData.room_layout,
      status: propertyData.status,
      available_date: propertyData.available_date,
      neighborhood: propertyData.neighborhood,
      city: propertyData.city,
    } : undefined

    await fetch(`/api/admin/video/${kohde}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ selectedImages: selected, overlay, propertyData: propPayload }),
    })
    setDirty(false)

    try {
      const res = await fetch(`/api/admin/video/${kohde}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: selected, overlay, propertyData: propPayload }),
      })
      const data = await res.json()

      if (data.status === "started" || data.status === "running") {
        pollStatus()
      } else {
        setGenStatus("failed")
        setGenOutput(data.error || "Virhe")
        setGenerating(false)
      }
    } catch {
      setGenStatus("failed")
      setGenOutput("Yhteysvirhe")
      setGenerating(false)
    }
  }

  // Poll generation status
  const pollStatus = () => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/video/${kohde}/generate`)
        const data = await res.json()
        setGenOutput(data.output || "")
        setGenStatus(data.status)

        if (data.status !== "running") {
          clearInterval(interval)
          setGenerating(false)
          if (data.status === "completed") {
            // Hae päivitetyt tiedot (hasVideo, videoSize)
            const infoRes = await fetch(`/api/admin/video/${kohde}`)
            const infoData = await infoRes.json()
            setHasVideo(infoData.hasVideo)
            setVideoSize(infoData.videoSize)
          }
        }
      } catch {
        clearInterval(interval)
        setGenerating(false)
      }
    }, 2000)
  }

  // Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        if (dirty) handleSave()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [dirty, kohde, selected])

  // Deselected images (not in selected list)
  const deselectedImages = allImages.filter((img) => !selected.includes(img.filename))

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-elea-text-muted">Ladataan...</p>
      </div>
    )
  }

  if (allImages.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold text-elea-navy mb-2">
          Videokierros — {kohde}
        </h1>
        <p className="text-elea-text-muted">
          Kuvia ei löytynyt kansiosta{" "}
          <code className="text-xs bg-secondary px-1 py-0.5 rounded">
            /data/matterport-archive/{kohde}/images/
          </code>
        </p>
        <p className="text-elea-text-muted text-sm mt-2">
          Käsittele kuvat ensin{" "}
          <a href="/admin/images" className="text-elea-navy underline">Kuvien hallinta</a>
          {" "}-sivulla, niin ne kopioidaan automaattisesti tänne.
        </p>
      </div>
    )
  }

  const estimatedDuration = Math.min(selected.length, 20) * 5
  const formatSize = (bytes: number) => {
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / 1024).toFixed(0)} KB`
  }

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-elea-navy flex items-center gap-2">
            Videokierros — {kohde}
            {dirty && <span className="w-2.5 h-2.5 rounded-full bg-blue-500" title="Tallentamattomia muutoksia" />}
          </h1>
          <p className="text-sm text-elea-text-muted mt-1">
            {selected.length} / {allImages.length} kuvaa valittu
            {selected.length >= 2 && (
              <span className="ml-2">
                — arvioitu kesto ~{estimatedDuration}s
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasVideo && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-600">
                Video olemassa ({formatSize(videoSize)})
              </span>
              <a
                href={`/api/video/${kohde}?download=1`}
                download
                className="text-xs px-2 py-1 rounded border border-elea-border hover:bg-secondary transition flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
                </svg>
                Lataa
              </a>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              dirty
                ? "bg-elea-navy text-white hover:opacity-90"
                : "bg-secondary text-elea-text-muted cursor-not-allowed"
            }`}
          >
            {saving ? "Tallennetaan..." : "Tallenna valinta"}
          </button>
          <button
            onClick={handleGenerate}
            disabled={selected.length < 2 || generating}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selected.length >= 2 && !generating
                ? "bg-elea-warm text-white hover:opacity-90"
                : "bg-secondary text-elea-text-muted cursor-not-allowed"
            }`}
          >
            {generating ? "Generoidaan..." : "Generoi video"}
          </button>
        </div>
      </div>

      {/* Overlay toggle + muokattavat kentät */}
      <div className="mb-6 p-4 rounded-xl border border-elea-border bg-card">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={overlay}
            onChange={(e) => {
              setOverlay(e.target.checked)
              setDirty(true)
            }}
            className="w-4 h-4 rounded border-elea-border text-elea-navy focus:ring-elea-navy"
          />
          <span className="text-sm font-medium text-elea-navy">
            Lisää tiedot videon päälle
          </span>
        </label>

        {overlay && propertyData && (
          <div className="mt-4 ml-7">
            {/* Muokattavat kentät */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-[11px] text-elea-text-muted uppercase tracking-wide mb-1">Vuokra €/kk</label>
                <input
                  type="number"
                  value={propertyData.rent || ""}
                  onChange={(e) => {
                    setPropertyData({ ...propertyData, rent: Number(e.target.value) || 0 })
                    setDirty(true)
                  }}
                  className="w-full px-2 py-1.5 text-sm rounded-lg border border-elea-border bg-white focus:ring-1 focus:ring-elea-navy focus:border-elea-navy"
                />
              </div>
              <div>
                <label className="block text-[11px] text-elea-text-muted uppercase tracking-wide mb-1">Pinta-ala m²</label>
                <input
                  type="number"
                  value={propertyData.area_m2 || ""}
                  onChange={(e) => {
                    setPropertyData({ ...propertyData, area_m2: Number(e.target.value) || null })
                    setDirty(true)
                  }}
                  className="w-full px-2 py-1.5 text-sm rounded-lg border border-elea-border bg-white focus:ring-1 focus:ring-elea-navy focus:border-elea-navy"
                />
              </div>
              <div>
                <label className="block text-[11px] text-elea-text-muted uppercase tracking-wide mb-1">Kokoonpano</label>
                <input
                  type="text"
                  value={propertyData.room_layout || ""}
                  placeholder="esim. 2h+k"
                  onChange={(e) => {
                    setPropertyData({ ...propertyData, room_layout: e.target.value || null })
                    setDirty(true)
                  }}
                  className="w-full px-2 py-1.5 text-sm rounded-lg border border-elea-border bg-white focus:ring-1 focus:ring-elea-navy focus:border-elea-navy"
                />
              </div>
              <div>
                <label className="block text-[11px] text-elea-text-muted uppercase tracking-wide mb-1">Status</label>
                <select
                  value={propertyData.status}
                  onChange={(e) => {
                    setPropertyData({ ...propertyData, status: e.target.value })
                    setDirty(true)
                  }}
                  className="w-full px-2 py-1.5 text-sm rounded-lg border border-elea-border bg-white focus:ring-1 focus:ring-elea-navy focus:border-elea-navy"
                >
                  <option value="available">Vapaa</option>
                  <option value="upcoming">Vapautumassa</option>
                  <option value="rented">Vuokrattu</option>
                </select>
              </div>
              {propertyData.status === "upcoming" && (
                <div>
                  <label className="block text-[11px] text-elea-text-muted uppercase tracking-wide mb-1">Vapautuu</label>
                  <input
                    type="date"
                    value={propertyData.available_date || ""}
                    onChange={(e) => {
                      setPropertyData({ ...propertyData, available_date: e.target.value || null })
                      setDirty(true)
                    }}
                    className="w-full px-2 py-1.5 text-sm rounded-lg border border-elea-border bg-white focus:ring-1 focus:ring-elea-navy focus:border-elea-navy"
                  />
                </div>
              )}
              <div>
                <label className="block text-[11px] text-elea-text-muted uppercase tracking-wide mb-1">Alue</label>
                <input
                  type="text"
                  value={propertyData.neighborhood || ""}
                  placeholder="esim. Niittykumpu"
                  onChange={(e) => {
                    setPropertyData({ ...propertyData, neighborhood: e.target.value || null })
                    setDirty(true)
                  }}
                  className="w-full px-2 py-1.5 text-sm rounded-lg border border-elea-border bg-white focus:ring-1 focus:ring-elea-navy focus:border-elea-navy"
                />
              </div>
              <div>
                <label className="block text-[11px] text-elea-text-muted uppercase tracking-wide mb-1">Kaupunki</label>
                <input
                  type="text"
                  value={propertyData.city || ""}
                  onChange={(e) => {
                    setPropertyData({ ...propertyData, city: e.target.value })
                    setDirty(true)
                  }}
                  className="w-full px-2 py-1.5 text-sm rounded-lg border border-elea-border bg-white focus:ring-1 focus:ring-elea-navy focus:border-elea-navy"
                />
              </div>
            </div>

            {/* Esikatselu — Final */}
            <div className="rounded-lg relative overflow-hidden aspect-video bg-gradient-to-b from-[#E5E8EC] via-[#D8DBE0] to-[#C9A86A]">
              {/* Info-bar (oikea ylä) */}
              <div className="absolute top-2 right-2 bg-[#1B3A5C] px-3 py-2 rounded-xl shadow-lg flex items-center gap-1 whitespace-nowrap overflow-hidden text-[10px] text-white font-medium">
                <span className="text-[#C8A96E] font-semibold">
                  {propertyData.status === "available" || !propertyData.available_date
                    ? "Vapaa"
                    : `Vapaa ${new Date(propertyData.available_date).getDate()}.${new Date(propertyData.available_date).getMonth() + 1}.`}
                </span>
                {propertyData.rent ? <><span className="opacity-35">·</span><span className="text-xs font-bold">{propertyData.rent} €/kk</span></> : null}
                {propertyData.area_m2 ? <><span className="opacity-35">·</span><span>{propertyData.area_m2} m²</span></> : null}
                {propertyData.room_layout ? <><span className="opacity-35">·</span><span>{propertyData.room_layout}</span></> : null}
                {(propertyData.neighborhood || propertyData.city) ? <><span className="opacity-35">·</span><span>{[propertyData.neighborhood, propertyData.city].filter(Boolean).join(", ")}</span></> : null}
              </div>

              {/* URL-box (oikea ala) */}
              <div className="absolute bottom-6 right-2 bg-[#C8A96E] text-white text-[9px] font-semibold px-2 py-1 rounded-md shadow-md">
                eleaasunnot.fi
              </div>
            </div>
          </div>
        )}

        {overlay && !propertyData && (
          <p className="mt-2 ml-7 text-xs text-elea-warm">
            Kohteen tietoja ei löytynyt. Tarkista että kohde on properties.json:ssa.
          </p>
        )}
      </div>

      {/* Generation status */}
      {genStatus !== "idle" && (
        <div
          className={`mb-6 p-4 rounded-xl border ${
            genStatus === "running"
              ? "border-elea-warm/50 bg-elea-warm-pale/20"
              : genStatus === "completed"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {genStatus === "running" && (
              <div className="w-4 h-4 border-2 border-elea-warm border-t-transparent rounded-full animate-spin" />
            )}
            <span className="text-sm font-medium">
              {genStatus === "running" && "Video generoidaan..."}
              {genStatus === "completed" && "Video generoitu!"}
              {genStatus === "failed" && "Generointi epäonnistui"}
            </span>
          </div>
          {genOutput && (
            <pre className="text-xs text-elea-text-muted whitespace-pre-wrap max-h-40 overflow-y-auto font-mono bg-white/50 rounded-lg p-2">
              {genOutput}
            </pre>
          )}
          {genStatus === "completed" && (
            <div className="mt-3">
              <video
                src={`/api/video/${kohde}?t=${Date.now()}`}
                controls
                playsInline
                className="w-full max-w-lg rounded-lg"
              />
            </div>
          )}
        </div>
      )}

      {/* Selection controls */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={selectAll} className="text-xs px-2 py-1 rounded border border-elea-border hover:bg-secondary transition">
          Valitse kaikki
        </button>
        <button onClick={selectNone} className="text-xs px-2 py-1 rounded border border-elea-border hover:bg-secondary transition">
          Poista valinnat
        </button>
        <span className="text-xs text-elea-text-light">
          Raahaa kuvia vaihtaaksesi järjestystä. Max 20 kuvaa videossa.
        </span>
      </div>

      {/* Selected images — draggable grid */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-elea-navy uppercase tracking-wide mb-3">
          Valitut kuvat ({selected.length})
          {selected.length > 20 && (
            <span className="text-xs font-normal normal-case text-elea-warm ml-2">
              Vain 20 ensimmäistä käytetään videossa
            </span>
          )}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {selected.map((filename, index) => {
            const isOverLimit = index >= 20
            const isDragging = dragIndex === index
            const isDragOver = dragOverIndex === index

            return (
              <div
                key={filename}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative rounded-xl border overflow-hidden cursor-grab active:cursor-grabbing transition-all ${
                  isDragging
                    ? "opacity-30 scale-95"
                    : isDragOver
                      ? "border-elea-warm border-2 scale-[1.02]"
                      : isOverLimit
                        ? "border-border/50 opacity-50"
                        : "border-elea-border"
                } ${isOverLimit ? "bg-secondary/50" : "bg-card"}`}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-secondary overflow-hidden">
                  <img
                    src={`/api/admin/video/${kohde}/thumbnail?file=${filename}`}
                    alt={filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    draggable={false}
                  />
                </div>

                {/* Index badge */}
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                  <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                    isOverLimit ? "bg-red-500/80 text-white" : "bg-black/60 text-white"
                  }`}>
                    {index + 1}
                  </span>
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleImage(filename)
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center transition"
                  title="Poista valinnasta"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Filename */}
                <div className="px-2 py-1.5 text-[10px] text-elea-text-muted truncate">
                  {filename}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Deselected images */}
      {deselectedImages.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-elea-text-light uppercase tracking-wide mb-3">
            Poistetut kuvat ({deselectedImages.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {deselectedImages.map((img) => (
              <div
                key={img.filename}
                className="relative rounded-xl border border-border/40 overflow-hidden bg-secondary/30 opacity-60 hover:opacity-100 transition"
              >
                <div className="aspect-video bg-secondary overflow-hidden">
                  <img
                    src={`/api/admin/video/${kohde}/thumbnail?file=${img.filename}`}
                    alt={img.filename}
                    className="w-full h-full object-cover grayscale"
                    loading="lazy"
                  />
                </div>

                {/* Add button */}
                <button
                  onClick={() => toggleImage(img.filename)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-green-500 text-white flex items-center justify-center transition"
                  title="Lisää valintaan"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>

                <div className="px-2 py-1.5 text-[10px] text-elea-text-muted truncate">
                  {img.filename}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing video preview */}
      {hasVideo && genStatus === "idle" && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-elea-navy uppercase tracking-wide mb-3">
            Nykyinen video
          </h2>
          <video
            src={`/api/video/${kohde}`}
            controls
            playsInline
            preload="metadata"
            className="w-full max-w-2xl rounded-xl border border-elea-border"
          />
        </div>
      )}
    </div>
  )
}
