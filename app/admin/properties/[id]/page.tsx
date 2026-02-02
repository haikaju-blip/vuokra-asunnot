"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

interface RawProperty {
  db_id: number
  id: string
  address: string
  city: string
  area_m2: number | null
  rooms: number | null
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
}

export default function PropertyEditPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params?.id as string

  const [property, setProperty] = useState<RawProperty | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [newHighlight, setNewHighlight] = useState("")

  // Form state
  const [status, setStatus] = useState("available")
  const [isPublic, setIsPublic] = useState(false)
  const [rent, setRent] = useState<number | "">("")
  const [areaM2, setAreaM2] = useState<number | "">("")
  const [rooms, setRooms] = useState<number | "">("")
  const [floor, setFloor] = useState<number | "">("")
  const [totalFloors, setTotalFloors] = useState<number | "">("")
  const [yearBuilt, setYearBuilt] = useState<number | "">("")
  const [balcony, setBalcony] = useState<boolean | null>(null)
  const [matterport, setMatterport] = useState("")
  const [availableDate, setAvailableDate] = useState("")
  const [highlights, setHighlights] = useState<string[]>([])
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (!propertyId) return

    fetch(`/api/admin/properties/${propertyId}`)
      .then((res) => res.json())
      .then((data: RawProperty) => {
        setProperty(data)
        setStatus(data.status || "available")
        setIsPublic(data.public || false)
        setRent(data.rent || "")
        setAreaM2(data.area_m2 || "")
        setRooms(data.rooms || "")
        setFloor(data.floor || "")
        setTotalFloors(data.total_floors || "")
        setYearBuilt(data.year_built || "")
        setBalcony(data.balcony)
        setMatterport(data.matterport || "")
        setAvailableDate(data.available_date || "")
        setHighlights(data.highlights || [])
        setDescription(data.description || "")
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [propertyId])

  const handleSave = async () => {
    setSaving(true)
    setMessage("")

    const updates = {
      status,
      public: isPublic,
      rent: rent === "" ? 0 : Number(rent),
      area_m2: areaM2 === "" ? null : Number(areaM2),
      rooms: rooms === "" ? null : Number(rooms),
      floor: floor === "" ? null : Number(floor),
      total_floors: totalFloors === "" ? null : Number(totalFloors),
      year_built: yearBuilt === "" ? null : Number(yearBuilt),
      balcony,
      matterport: matterport || null,
      available_date: availableDate || null,
      highlights: highlights.length > 0 ? highlights : null,
      description: description || null
    }

    try {
      const res = await fetch(`/api/admin/properties/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      })

      if (res.ok) {
        setMessage("Tallennettu!")
        setTimeout(() => setMessage(""), 3000)
      } else {
        setMessage("Tallennus epäonnistui")
      }
    } catch {
      setMessage("Tallennus epäonnistui")
    }

    setSaving(false)
  }

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setHighlights([...highlights, newHighlight.trim()])
      setNewHighlight("")
    }
  }

  const removeHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <p className="text-muted-foreground">Ladataan...</p>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background p-8">
        <p className="text-muted-foreground">Kohdetta ei löytynyt</p>
        <Link href="/admin" className="text-primary hover:underline mt-4 inline-block">
          Takaisin
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Takaisin
              </Link>
              <h1 className="text-xl font-semibold mt-1">{property.address}</h1>
              <p className="text-sm text-muted-foreground">{property.city}</p>
            </div>
            <div className="flex items-center gap-4">
              {message && (
                <span
                  className={`text-sm ${
                    message === "Tallennettu!" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {message}
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 rounded-[12px] bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition"
              >
                {saving ? "Tallennetaan..." : "Tallenna"}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Perustiedot */}
          <section className="bg-card border border-border rounded-[16px] p-6">
            <h2 className="font-semibold mb-4">Perustiedot</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="available">Vapaa</option>
                  <option value="rented">Vuokrattu</option>
                  <option value="hidden">Piilotettu</option>
                </select>
              </div>

              {/* Julkinen */}
              <div>
                <label className="block text-sm font-medium mb-2">Julkinen</label>
                <label className="flex items-center gap-3 px-4 py-3 rounded-[12px] border border-border cursor-pointer hover:bg-secondary/30">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-5 h-5 rounded border-border"
                  />
                  <span className="text-sm">Näytä julkisella sivustolla</span>
                </label>
              </div>

              {/* Vuokra */}
              <div>
                <label className="block text-sm font-medium mb-2">Vuokra (€/kk)</label>
                <input
                  type="number"
                  value={rent}
                  onChange={(e) => setRent(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
              </div>

              {/* Vapautumispäivä */}
              <div>
                <label className="block text-sm font-medium mb-2">Vapautumispäivä</label>
                <input
                  type="date"
                  value={availableDate}
                  onChange={(e) => setAvailableDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Neliöt */}
              <div>
                <label className="block text-sm font-medium mb-2">Neliöt (m²)</label>
                <input
                  type="number"
                  value={areaM2}
                  onChange={(e) => setAreaM2(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="-"
                />
              </div>

              {/* Huoneet */}
              <div>
                <label className="block text-sm font-medium mb-2">Huoneet</label>
                <input
                  type="number"
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="-"
                />
              </div>

              {/* Kerros */}
              <div>
                <label className="block text-sm font-medium mb-2">Kerros</label>
                <input
                  type="number"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="-"
                />
              </div>

              {/* Kerroksia yhteensä */}
              <div>
                <label className="block text-sm font-medium mb-2">Kerroksia yhteensä</label>
                <input
                  type="number"
                  value={totalFloors}
                  onChange={(e) =>
                    setTotalFloors(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="-"
                />
              </div>

              {/* Rakennusvuosi */}
              <div>
                <label className="block text-sm font-medium mb-2">Rakennusvuosi</label>
                <input
                  type="number"
                  value={yearBuilt}
                  onChange={(e) =>
                    setYearBuilt(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="-"
                />
              </div>

              {/* Parveke */}
              <div>
                <label className="block text-sm font-medium mb-2">Parveke</label>
                <select
                  value={balcony === null ? "" : balcony ? "yes" : "no"}
                  onChange={(e) => {
                    if (e.target.value === "") setBalcony(null)
                    else setBalcony(e.target.value === "yes")
                  }}
                  className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Ei tiedossa</option>
                  <option value="yes">Kyllä</option>
                  <option value="no">Ei</option>
                </select>
              </div>
            </div>
          </section>

          {/* 3D-kierros */}
          <section className="bg-card border border-border rounded-[16px] p-6">
            <h2 className="font-semibold mb-4">3D-kierros (Matterport)</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Matterport ID</label>
              <input
                type="text"
                value={matterport}
                onChange={(e) => setMatterport(e.target.value)}
                className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Esim. SxQL3iGyoDo"
              />
              {matterport && (
                <a
                  href={`https://my.matterport.com/show/?m=${matterport}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline mt-2 inline-block"
                >
                  Avaa 3D-kierros →
                </a>
              )}
            </div>
          </section>

          {/* Highlights */}
          <section className="bg-card border border-border rounded-[16px] p-6">
            <h2 className="font-semibold mb-4">Highlights / Pillerit</h2>

            <div className="flex flex-wrap gap-2 mb-4">
              {highlights.map((h, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-[8px] bg-secondary text-sm"
                >
                  {h}
                  <button
                    onClick={() => removeHighlight(i)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={`Poista ${h}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {highlights.length === 0 && (
                <p className="text-sm text-muted-foreground">Ei vielä highlighteja</p>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addHighlight()
                  }
                }}
                className="flex-1 px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Lisää uusi highlight..."
              />
              <button
                onClick={addHighlight}
                disabled={!newHighlight.trim()}
                className="px-4 py-3 rounded-[12px] border border-border hover:bg-secondary disabled:opacity-50 transition"
              >
                Lisää
              </button>
            </div>
          </section>

          {/* Esittelyteksti */}
          <section className="bg-card border border-border rounded-[16px] p-6">
            <h2 className="font-semibold mb-4">Esittelyteksti</h2>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={12}
              className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              placeholder="Kirjoita kohteen esittelyteksti..."
            />
            <p className="text-xs text-muted-foreground mt-2">
              Rivinvaihdot säilyvät. Ei markdown-muotoilua.
            </p>
          </section>

          {/* Linkit */}
          <section className="bg-card border border-border rounded-[16px] p-6">
            <h2 className="font-semibold mb-4">Linkit</h2>

            <div className="flex flex-wrap gap-4">
              <Link
                href={`/admin/images/${property.db_id}`}
                className="px-4 py-2 rounded-[12px] border border-border hover:bg-secondary transition"
              >
                Hallinnoi kuvia →
              </Link>
              <Link
                href={`/kohde/${property.id}`}
                target="_blank"
                className="px-4 py-2 rounded-[12px] border border-border hover:bg-secondary transition"
              >
                Katso julkinen sivu →
              </Link>
            </div>
          </section>

          {/* Tallenna (bottom) */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 rounded-[12px] bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition"
            >
              {saving ? "Tallennetaan..." : "Tallenna muutokset"}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
