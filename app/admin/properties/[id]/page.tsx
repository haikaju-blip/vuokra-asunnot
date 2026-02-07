"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { PropertyContracts } from "@/components/property-contracts"

interface RawProperty {
  db_id: number
  id: string
  address: string
  city: string
  area_m2: number | null
  rooms: number | null
  room_layout: string | null
  floor: number | null
  total_floors: number | null
  balcony: boolean | null
  rent: number
  landlord: string
  contract_status: string
  status: string
  matterport: string | null
  images: string[]
  public: boolean
  notes: string | null
  year_built: number | null
  highlights: string[] | null
  description: string | null
  available_date: string | null
  neighborhood: string | null
  master_id: string | null
  media_source: string | null
}

// Fields that inherit from master
const INHERITABLE_FIELDS = ['area_m2', 'rooms', 'room_layout', 'balcony', 'year_built', 'matterport', 'highlights', 'description']

interface AdminProperty {
  id: string
  db_id: number
  address: string
  city: string
  status: string
  public: boolean
}

interface RelatedProperty {
  id: string
  db_id: number
  address: string
  city: string
  master_id: string | null
}

function extractStreetAddress(fullAddress: string): string {
  const parts = fullAddress.split(" ")
  const filtered = parts.filter(p => !/^\d{5}$/.test(p) && !["Oulu", "Vantaa", "Helsinki", "Espoo", "Tampere", "Turku"].includes(p))
  return filtered.join(" ")
}

// Preset highlights grouped by category
const PRESET_HIGHLIGHTS: Record<string, string[]> = {
  "Varustelu": ["Parveke", "Sauna", "Kalustettu", "Hissi", "Lemmikit Ok"],
  "Keittiö": ["Astianpk", "Induktio", "Jää-pakastink", "Mikro"],
  "Kylpyhuone": ["Suihkuseinä", "Pesuk", "Pesuk valmius"],
  "Lattia & sisustus": ["Vinyyli", "Parketti", "Sälekaihtimet", "Verhokiskot"],
  "Huoneisto": ["Korkeat huoneet", "Loft", "Valoisa", "Vaatehuone"],
  "Suunta & sijainti": ["Etelä", "Länsi", "Rauhallinen", "Sisäpihalle"],
  "Kunto": ["Remontoitu", "Kuin uusi"],
  "Netti": ["1Gbit", "50Mbit", "Netti"],
  "Taloyhtiö": ["Pesula", "Taloyhtiö sauna", "Autopaikka", "Lämpötolppa"],
  "Liikenne": ["Metro", "Hyvät julkiset"],
}

export default function PropertyEditPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params?.id as string

  const [property, setProperty] = useState<RawProperty | null>(null)
  const [allProperties, setAllProperties] = useState<AdminProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [isDirty, setIsDirty] = useState(false)
  const [newHighlight, setNewHighlight] = useState("")
  const [showHighlightInput, setShowHighlightInput] = useState(false)
  const [editingHighlightIndex, setEditingHighlightIndex] = useState<number | null>(null)
  const [editingHighlightValue, setEditingHighlightValue] = useState("")
  const [draggedHighlightIndex, setDraggedHighlightIndex] = useState<number | null>(null)
  const [dragOverHighlightIndex, setDragOverHighlightIndex] = useState<number | null>(null)
  const highlightInputRef = useRef<HTMLInputElement>(null)
  const editHighlightInputRef = useRef<HTMLInputElement>(null)
  const [rawImages, setRawImages] = useState<{ name: string; path: string }[]>([])

  // Form state
  const [status, setStatus] = useState("available")
  const [isPublic, setIsPublic] = useState(false)
  const [rent, setRent] = useState<number | "">("")
  const [areaM2, setAreaM2] = useState<number | "">("")
  const [rooms, setRooms] = useState<number | "">("")
  const [roomLayout, setRoomLayout] = useState("")
  const [floor, setFloor] = useState<number | "">("")
  const [totalFloors, setTotalFloors] = useState<number | "">("")
  const [yearBuilt, setYearBuilt] = useState<number | "">("")
  const [balcony, setBalcony] = useState<boolean | null>(null)
  const [matterport, setMatterport] = useState("")
  const [mediaSource, setMediaSource] = useState("")
  const [availableDate, setAvailableDate] = useState("")
  const [neighborhood, setNeighborhood] = useState("")
  const [highlights, setHighlights] = useState<string[]>([])
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState("")
  const [masterId, setMasterId] = useState<string | null>(null)
  const [masterProperty, setMasterProperty] = useState<RawProperty | null>(null)
  const [relatedProperties, setRelatedProperties] = useState<RelatedProperty[]>([])

  // Original values for dirty check
  const [originalValues, setOriginalValues] = useState<any>(null)

  // Load all properties for navigation
  useEffect(() => {
    fetch("/api/admin/properties")
      .then((res) => res.json())
      .then((data: AdminProperty[]) => setAllProperties(data))
      .catch(() => {})
  }, [])

  // Load property
  useEffect(() => {
    if (!propertyId) return

    fetch(`/api/admin/properties/${propertyId}`)
      .then((res) => res.json())
      .then(async (data: RawProperty) => {
        // Load raw images from dropzone
        fetch(`/api/images/raw/${data.db_id}`)
          .then(res => res.json())
          .then(imgData => setRawImages(imgData.images || []))
          .catch(() => {})

        // Load master property if this is a slave
        if (data.master_id) {
          try {
            const masterRes = await fetch(`/api/admin/properties/${data.master_id}`)
            const masterData = await masterRes.json()
            setMasterProperty(masterData)
          } catch {}
        } else {
          setMasterProperty(null)
        }
        setMasterId(data.master_id || null)

        // Load related properties (same building)
        fetch(`/api/properties/related/${data.db_id}`)
          .then(res => res.json())
          .then(relData => setRelatedProperties(relData.related || []))
          .catch(() => setRelatedProperties([]))

        setProperty(data)
        setStatus(data.status || "available")
        setIsPublic(data.public || false)
        setRent(data.rent || "")
        setAreaM2(data.area_m2 || "")
        setRooms(data.rooms || "")
        setRoomLayout(data.room_layout || "")
        setFloor(data.floor || "")
        setTotalFloors(data.total_floors || "")
        setYearBuilt(data.year_built || "")
        setBalcony(data.balcony)
        setMatterport(data.matterport || "")
        setMediaSource(data.media_source || "")
        setAvailableDate(data.available_date || "")
        setNeighborhood(data.neighborhood || "")
        setHighlights(data.highlights || [])
        setDescription(data.description || "")
        setNotes(data.notes || "")
        setOriginalValues({
          status: data.status || "available",
          isPublic: data.public || false,
          rent: data.rent || "",
          areaM2: data.area_m2 || "",
          rooms: data.rooms || "",
          roomLayout: data.room_layout || "",
          floor: data.floor || "",
          totalFloors: data.total_floors || "",
          yearBuilt: data.year_built || "",
          balcony: data.balcony,
          matterport: data.matterport || "",
          mediaSource: data.media_source || "",
          availableDate: data.available_date || "",
          neighborhood: data.neighborhood || "",
          highlights: data.highlights || [],
          description: data.description || "",
          notes: data.notes || "",
          masterId: data.master_id || null
        })
        setIsDirty(false)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [propertyId])

  // Check if dirty
  useEffect(() => {
    if (!originalValues) return

    const currentValues = {
      status, isPublic, rent, areaM2, rooms, roomLayout, floor, totalFloors, yearBuilt,
      balcony, matterport, mediaSource, availableDate, neighborhood, highlights, description, notes, masterId
    }

    const dirty = JSON.stringify(currentValues) !== JSON.stringify(originalValues)
    setIsDirty(dirty)
  }, [status, isPublic, rent, areaM2, rooms, roomLayout, floor, totalFloors, yearBuilt, balcony, matterport, mediaSource, availableDate, neighborhood, highlights, description, notes, masterId, originalValues])

  // Save handler
  const handleSave = useCallback(async () => {
    if (!isDirty || saving) return

    setSaving(true)
    setSaveState("saving")

    const updates = {
      status,
      public: isPublic,
      rent: rent === "" ? 0 : Number(rent),
      area_m2: areaM2 === "" ? null : Number(areaM2),
      rooms: rooms === "" ? null : Number(rooms),
      room_layout: roomLayout || null,
      floor: floor === "" ? null : Number(floor),
      total_floors: totalFloors === "" ? null : Number(totalFloors),
      year_built: yearBuilt === "" ? null : Number(yearBuilt),
      balcony,
      matterport: matterport || null,
      media_source: mediaSource || null,
      available_date: availableDate || null,
      neighborhood: neighborhood || null,
      highlights: highlights.length > 0 ? highlights : null,
      description: description || null,
      notes: notes || null,
      master_id: masterId
    }

    try {
      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      })

      if (res.ok) {
        setSaveState("saved")
        setOriginalValues({
          status, isPublic, rent, areaM2, rooms, roomLayout, floor, totalFloors, yearBuilt,
          balcony, matterport, mediaSource, availableDate, neighborhood, highlights, description, notes, masterId
        })
        setIsDirty(false)
        setTimeout(() => setSaveState("idle"), 2000)
      } else {
        setSaveState("error")
        setTimeout(() => setSaveState("idle"), 3000)
      }
    } catch {
      setSaveState("error")
      setTimeout(() => setSaveState("idle"), 3000)
    }

    setSaving(false)
  }, [isDirty, saving, status, isPublic, rent, areaM2, rooms, roomLayout, floor, totalFloors, yearBuilt, balcony, matterport, mediaSource, availableDate, neighborhood, highlights, description, notes, masterId, propertyId])

  // Auto-save: tallenna 2s kuluttua muutoksesta
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isDirty || saving) return

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      handleSave()
    }, 2000)

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [isDirty, saving, handleSave])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        handleSave()
      }

      // Alt + Arrow for navigation
      if (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        e.preventDefault()
        const currentIndex = allProperties.findIndex(p => p.id === propertyId)
        if (currentIndex === -1) return

        const newIndex = e.key === "ArrowLeft"
          ? (currentIndex - 1 + allProperties.length) % allProperties.length
          : (currentIndex + 1) % allProperties.length

        router.push(`/admin/properties/${allProperties[newIndex].id}`)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleSave, allProperties, propertyId, router])

  // Navigation helpers
  const currentIndex = allProperties.findIndex(p => p.id === propertyId)
  const prevProperty = currentIndex > 0 ? allProperties[currentIndex - 1] : allProperties[allProperties.length - 1]
  const nextProperty = currentIndex < allProperties.length - 1 ? allProperties[currentIndex + 1] : allProperties[0]

  // Highlight handlers
  const addHighlight = () => {
    if (newHighlight.trim()) {
      setHighlights([...highlights, newHighlight.trim()])
      setNewHighlight("")
      setShowHighlightInput(false)
    }
  }

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index))
  }

  const startEditHighlight = (index: number) => {
    setEditingHighlightIndex(index)
    setEditingHighlightValue(highlights[index])
  }

  const saveEditHighlight = () => {
    if (editingHighlightIndex !== null && editingHighlightValue.trim()) {
      const newHighlights = [...highlights]
      newHighlights[editingHighlightIndex] = editingHighlightValue.trim()
      setHighlights(newHighlights)
    }
    setEditingHighlightIndex(null)
    setEditingHighlightValue("")
  }

  const cancelEditHighlight = () => {
    setEditingHighlightIndex(null)
    setEditingHighlightValue("")
  }

  // Drag and drop handlers for highlights
  const handleDragStart = (index: number) => {
    setDraggedHighlightIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverHighlightIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverHighlightIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedHighlightIndex === null || draggedHighlightIndex === dropIndex) {
      setDraggedHighlightIndex(null)
      setDragOverHighlightIndex(null)
      return
    }

    const newHighlights = [...highlights]
    const [draggedItem] = newHighlights.splice(draggedHighlightIndex, 1)
    newHighlights.splice(dropIndex, 0, draggedItem)
    setHighlights(newHighlights)
    setDraggedHighlightIndex(null)
    setDragOverHighlightIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedHighlightIndex(null)
    setDragOverHighlightIndex(null)
  }

  // Toggle preset highlight
  const togglePresetHighlight = (highlight: string) => {
    if (highlights.includes(highlight)) {
      setHighlights(highlights.filter(h => h !== highlight))
    } else {
      setHighlights([...highlights, highlight])
    }
  }

  useEffect(() => {
    if (showHighlightInput && highlightInputRef.current) {
      highlightInputRef.current.focus()
    }
  }, [showHighlightInput])

  useEffect(() => {
    if (editingHighlightIndex !== null && editHighlightInputRef.current) {
      editHighlightInputRef.current.focus()
      editHighlightInputRef.current.select()
    }
  }, [editingHighlightIndex])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Ladataan...</p>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Kohdetta ei löytynyt</p>
      </div>
    )
  }

  const streetAddress = extractStreetAddress(property.address)

  return (
    <div className="h-screen flex flex-col">
      {/* Sticky Header */}
      <header className="flex-shrink-0 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Navigation + Title */}
          <div className="flex items-center gap-3">
            {/* Nav buttons */}
            <div className="flex gap-1">
              <Link
                href={`/admin/properties/${prevProperty?.id}`}
                className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-border hover:bg-secondary transition"
                title={`Edellinen (Alt+←)`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <Link
                href={`/admin/properties/${nextProperty?.id}`}
                className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-border hover:bg-secondary transition"
                title={`Seuraava (Alt+→)`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-base font-semibold">
                <span className="text-muted-foreground">{property.db_id}</span>
                <span className="text-muted-foreground mx-1.5">·</span>
                {streetAddress}
              </h1>
              <p className="text-xs text-muted-foreground">{property.city}</p>
            </div>
          </div>

          {/* Right: Save button */}
          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" title="Tallentamattomia muutoksia" />
            )}
            <button
              onClick={handleSave}
              disabled={!isDirty || saving}
              className={`px-4 py-1.5 rounded-[8px] text-sm font-medium transition flex items-center gap-2 ${
                saveState === "saved"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : saveState === "error"
                    ? "bg-red-100 text-red-700 border border-red-200"
                    : isDirty
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "bg-secondary text-muted-foreground border border-border"
              }`}
            >
              {saveState === "saving" ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Tallentaa...
                </>
              ) : saveState === "saved" ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tallennettu
                </>
              ) : saveState === "error" ? (
                "Virhe!"
              ) : (
                <>
                  <span className="text-xs opacity-70">⌘S</span>
                  Tallenna
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content - two columns */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Panel - 60% */}
          <div className="flex-1 lg:w-3/5 p-4 lg:p-6 space-y-6 lg:border-r border-border overflow-y-auto">
            {/* Status Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm rounded-[8px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="available">Vapaa</option>
                  <option value="rented">Vuokrattu</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Julkinen</label>
                <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] border border-border cursor-pointer hover:bg-secondary/30 h-[34px]">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm">{isPublic ? "Kyllä" : "Ei"}</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Vuokra</label>
                <div className="relative">
                  <input
                    type="number"
                    value={rent}
                    onChange={(e) => setRent(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-2.5 py-1.5 pr-12 text-sm rounded-[8px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€/kk</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Vapautuu</label>
                <input
                  type="date"
                  value={availableDate}
                  onChange={(e) => setAvailableDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm rounded-[8px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="col-span-2 sm:col-span-4">
                <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1">Alue</label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm rounded-[8px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="esim. Keskusta, Niittykumpu"
                />
              </div>
            </div>

            {/* Details Grid */}
            <div>
              <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Tiedot</h2>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">m²</label>
                  <input
                    type="number"
                    value={areaM2}
                    onChange={(e) => setAreaM2(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-2.5 py-1.5 text-sm rounded-[8px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="-"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Huoneet</label>
                  <input
                    type="number"
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-2.5 py-1.5 text-sm rounded-[8px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="-"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] text-muted-foreground mb-1">Kokoonpano</label>
                  <input
                    type="text"
                    value={roomLayout}
                    onChange={(e) => setRoomLayout(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm rounded-[8px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="esim. 2h + k + s"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Kerros</label>
                  <div className="flex gap-1 items-center">
                    <input
                      type="number"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-2.5 py-1.5 text-sm rounded-[8px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="-"
                    />
                    <span className="text-muted-foreground text-sm">/</span>
                    <input
                      type="number"
                      value={totalFloors}
                      onChange={(e) => setTotalFloors(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-2.5 py-1.5 text-sm rounded-[8px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="-"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Rak.vuosi</label>
                  <input
                    type="number"
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-2.5 py-1.5 text-sm rounded-[8px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="-"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Parveke</label>
                  <select
                    value={balcony === null ? "" : balcony ? "yes" : "no"}
                    onChange={(e) => {
                      if (e.target.value === "") setBalcony(null)
                      else setBalcony(e.target.value === "yes")
                    }}
                    className="w-full px-2.5 py-1.5 text-sm rounded-[8px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">-</option>
                    <option value="yes">Kyllä</option>
                    <option value="no">Ei</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Matterport</label>
                  <input
                    type="text"
                    value={matterport}
                    onChange={(e) => setMatterport(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm rounded-[8px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                    placeholder="ID"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] text-muted-foreground mb-1">Mediakansio</label>
                  <select
                    value={mediaSource}
                    onChange={(e) => setMediaSource(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-sm rounded-[8px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono"
                  >
                    <option value="">Oma ({property.id})</option>
                    {relatedProperties.map(rel => (
                      <option key={rel.id} value={rel.id}>{rel.id}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div>
              <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Highlights</h2>

              {/* Selected highlights - draggable */}
              <div className="flex flex-wrap gap-1.5 mb-3 min-h-[28px] p-2 rounded-[8px] border border-border bg-muted/30">
                {highlights.length === 0 && (
                  <span className="text-xs text-muted-foreground">Valitse alta tai lisää oma</span>
                )}
                {highlights.map((h, i) => (
                  editingHighlightIndex === i ? (
                    <input
                      key={i}
                      ref={editHighlightInputRef}
                      type="text"
                      value={editingHighlightValue}
                      onChange={(e) => setEditingHighlightValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          saveEditHighlight()
                        }
                        if (e.key === "Escape") {
                          cancelEditHighlight()
                        }
                      }}
                      onBlur={saveEditHighlight}
                      className="px-2 py-0.5 text-sm rounded-[6px] border border-primary bg-background focus:outline-none focus:ring-2 focus:ring-ring min-w-[80px]"
                    />
                  ) : (
                    <span
                      key={i}
                      draggable
                      onDragStart={() => handleDragStart(i)}
                      onDragOver={(e) => handleDragOver(e, i)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, i)}
                      onDragEnd={handleDragEnd}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-primary text-primary-foreground text-sm group cursor-grab active:cursor-grabbing select-none transition-all ${
                        draggedHighlightIndex === i ? "opacity-50 scale-95" : ""
                      } ${
                        dragOverHighlightIndex === i && draggedHighlightIndex !== i
                          ? "ring-2 ring-white ring-offset-1"
                          : ""
                      }`}
                      onClick={() => startEditHighlight(i)}
                      title="Raahaa järjestääksesi, klikkaa muokataksesi"
                    >
                      <svg className="w-3 h-3 opacity-50 mr-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5" />
                        <circle cx="15" cy="6" r="1.5" />
                        <circle cx="9" cy="12" r="1.5" />
                        <circle cx="15" cy="12" r="1.5" />
                        <circle cx="9" cy="18" r="1.5" />
                        <circle cx="15" cy="18" r="1.5" />
                      </svg>
                      {h}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeHighlight(i)
                        }}
                        className="opacity-70 hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </span>
                  )
                ))}
                {showHighlightInput ? (
                  <input
                    ref={highlightInputRef}
                    type="text"
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addHighlight()
                      }
                      if (e.key === "Escape") {
                        setShowHighlightInput(false)
                        setNewHighlight("")
                      }
                    }}
                    onBlur={() => {
                      if (newHighlight.trim()) {
                        addHighlight()
                      } else {
                        setShowHighlightInput(false)
                      }
                    }}
                    className="px-2 py-0.5 text-sm rounded-[6px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring w-32"
                    placeholder="Lisää..."
                  />
                ) : (
                  <button
                    onClick={() => setShowHighlightInput(true)}
                    className="px-2 py-0.5 rounded-[6px] border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition bg-background"
                  >
                    + Oma
                  </button>
                )}
              </div>

              {/* Preset categories - two columns */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {Object.entries(PRESET_HIGHLIGHTS).map(([category, presets]) => (
                  <div key={category}>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{category}</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {presets.map((preset) => {
                        const isSelected = highlights.includes(preset)
                        return (
                          <button
                            key={preset}
                            onClick={() => togglePresetHighlight(preset)}
                            className={`px-1.5 py-0.5 rounded-[5px] text-[11px] transition-all ${
                              isSelected
                                ? "bg-primary/20 text-primary border border-primary/30"
                                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-transparent"
                            }`}
                          >
                            {isSelected && <span className="mr-0.5">✓</span>}
                            {preset}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Esittelyteksti</h2>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-2.5 py-2 text-sm rounded-[8px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[100px]"
                placeholder="Kirjoita kohteen esittelyteksti..."
              />
            </div>

            {/* Notes (internal) */}
            <div>
              <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Muistiinpanot <span className="font-normal">(sisäinen)</span></h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-2.5 py-2 text-sm rounded-[8px] border border-border bg-muted/30 focus:outline-none focus:ring-2 focus:ring-ring resize-y text-muted-foreground"
                placeholder="Sisäiset muistiinpanot..."
              />
            </div>
          </div>

          {/* Right Panel - 40% */}
          <div className="lg:w-2/5 p-4 lg:p-6 space-y-6 bg-muted/20 overflow-y-auto">
            {/* Image Gallery - from dropzone */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Kuvat</h2>
                <span className="text-xs text-muted-foreground">{rawImages.length} kpl</span>
              </div>
              {rawImages.length > 0 ? (
                <div className="grid grid-cols-4 gap-1.5">
                  {rawImages.slice(0, 7).map((img, i) => (
                    <div key={i} className="aspect-square rounded-[6px] overflow-hidden bg-muted relative">
                      <Image
                        src={img.path}
                        alt={`Kuva ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized
                      />
                    </div>
                  ))}
                  {rawImages.length > 7 && (
                    <Link
                      href={`/admin/images/${property.db_id}`}
                      className="aspect-square rounded-[6px] bg-secondary flex items-center justify-center text-sm text-muted-foreground hover:bg-secondary/80 transition"
                    >
                      +{rawImages.length - 7}
                    </Link>
                  )}
                  {rawImages.length <= 7 && (
                    <Link
                      href={`/admin/images/${property.db_id}`}
                      className="aspect-square rounded-[6px] border border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </Link>
                  )}
                </div>
              ) : (
                <Link
                  href={`/admin/images/${property.db_id}`}
                  className="block p-4 rounded-[8px] border border-dashed border-border text-center text-sm text-muted-foreground hover:border-foreground hover:text-foreground transition"
                >
                  Ei kuvia — klikkaa lisätäksesi
                </Link>
              )}
              <Link
                href={`/admin/images/${property.db_id}`}
                className="block mt-2 text-xs text-primary hover:underline"
              >
                Hallitse kuvia →
              </Link>
            </div>

            {/* Quick actions */}
            <div className="border-t border-border pt-4">
              <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-3">Toiminnot</h2>
              <div className="space-y-2">
                <Link
                  href={`/kohde/${property.id}`}
                  target="_blank"
                  className="flex items-center justify-between px-3 py-2 rounded-[8px] border border-border hover:bg-secondary transition text-sm"
                >
                  <span>Julkinen sivu</span>
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
                <Link
                  href={`/admin/video/${mediaSource || property.id}`}
                  className="flex items-center justify-between px-3 py-2 rounded-[8px] border border-border hover:bg-secondary transition text-sm"
                >
                  <span>Videokierros</span>
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </Link>
                <Link
                  href={`/admin/tour/${mediaSource || property.id}`}
                  className="flex items-center justify-between px-3 py-2 rounded-[8px] border border-border hover:bg-secondary transition text-sm"
                >
                  <span>360° kierros</span>
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Link>
                {property.matterport && (
                  <a
                    href={`https://my.matterport.com/show/?m=${property.matterport}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2 rounded-[8px] border border-border hover:bg-secondary transition text-sm"
                  >
                    <span>Avaa 3D-kierros</span>
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Master/Slave Status */}
            <div className="border-t border-border pt-4">
              <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-3">Periytyminen</h2>
              {masterId ? (
                // This is a SLAVE
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-medium">SLAVE</span>
                    <span className="text-muted-foreground">Perii kohteesta:</span>
                  </div>
                  {masterProperty && (
                    <Link
                      href={`/admin/properties/${masterProperty.id}`}
                      className="block p-2 rounded-[8px] border border-amber-200 bg-amber-50 hover:bg-amber-100 transition"
                    >
                      <p className="text-sm font-medium">{extractStreetAddress(masterProperty.address)}</p>
                      <p className="text-xs text-muted-foreground">#{masterProperty.db_id} · {masterProperty.city}</p>
                    </Link>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Periytyvät: m², huoneet, kokoonpano, parveke, rak.vuosi, matterport, highlights, esittelyteksti
                  </p>
                  <button
                    onClick={() => setMasterId(null)}
                    className="w-full px-3 py-2 text-sm rounded-[8px] border border-red-200 text-red-600 hover:bg-red-50 transition text-center"
                  >
                    Irrota masterista
                  </button>
                </div>
              ) : (
                // This is standalone - can select a master from related properties
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-medium">ITSENÄINEN</span>
                  </div>
                  {relatedProperties.length > 0 ? (
                    <>
                      <p className="text-xs text-muted-foreground">Valitse master saman talon kohteista:</p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {relatedProperties.map(rel => {
                          const isAlreadyMaster = rel.master_id === property.id
                          return (
                            <button
                              key={rel.id}
                              onClick={() => !isAlreadyMaster && setMasterId(rel.id)}
                              disabled={isAlreadyMaster}
                              className={`w-full text-left p-2 rounded-[8px] border transition text-xs ${
                                isAlreadyMaster
                                  ? "border-green-200 bg-green-50 text-green-700 cursor-default"
                                  : "border-border hover:border-primary hover:bg-primary/5 cursor-pointer"
                              }`}
                              title={isAlreadyMaster ? "Tämä kohde perii sinulta" : "Klikkaa asettaaksesi masteriksi"}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{extractStreetAddress(rel.address)}</span>
                                {isAlreadyMaster ? (
                                  <span className="px-1.5 py-0.5 rounded bg-green-100 text-[10px]">SLAVE</span>
                                ) : (
                                  <span className="text-muted-foreground">→ Master</span>
                                )}
                              </div>
                              <span className="text-muted-foreground">#{rel.db_id}</span>
                            </button>
                          )
                        })}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Master-kohteelta periytyvät: m², huoneet, kokoonpano, parveke, rak.vuosi, matterport, highlights, esittelyteksti
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Ei löytynyt saman talon kohteita. Master/slave toimii vain saman rakennuksen asunnoille.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Contracts */}
            <div className="border-t border-border pt-4">
              <PropertyContracts propertyId={property.db_id} />
            </div>

            {/* Read-only info */}
            <div className="border-t border-border pt-4">
              <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-3">Tiedot</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Vuokranantaja</dt>
                  <dd className="font-medium">{property.landlord}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Sopimus</dt>
                  <dd className={`font-medium ${property.contract_status === "signed" ? "text-green-600" : ""}`}>
                    {property.contract_status === "signed" ? "Voimassa" : property.contract_status === "draft" ? "Luonnos" : property.contract_status}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">ID</dt>
                  <dd className="font-mono text-xs">#{property.db_id}</dd>
                </div>
              </dl>
            </div>

            {/* Keyboard shortcuts help */}
            <div className="border-t border-border pt-4">
              <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">Pikanäppäimet</h2>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-mono">⌘S</kbd>
                  <span>Tallenna</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-mono">Alt+←</kbd>
                  <span>Edellinen kohde</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-mono">Alt+→</kbd>
                  <span>Seuraava kohde</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
