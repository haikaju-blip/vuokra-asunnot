"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

interface RawImage {
  name: string
  path: string
  size: number
  sizeFormatted: string
}

interface PropertyInfo {
  id: string
  db_id: number
  name: string
  address: string
}

interface RelatedProperty {
  id: string
  db_id: number
  name: string
  address: string
  city: string
  size: number | null
  rooms: string | null
  rent: number | null
}

interface PropertyWithImages {
  id: string
  imageCount: number
  address: string | null
  status: string | null
}

export default function ImageSelectorPage() {
  const params = useParams()
  const propertyId = params?.id as string

  const [property, setProperty] = useState<PropertyInfo | null>(null)
  const [rawImages, setRawImages] = useState<RawImage[]>([])
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [relatedProperties, setRelatedProperties] = useState<RelatedProperty[]>([])
  const [selectedRelated, setSelectedRelated] = useState<Set<string>>(new Set())
  const [allProperties, setAllProperties] = useState<PropertyWithImages[]>([])
  const [doneProperties, setDoneProperties] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load all properties with raw images (for sidebar)
    fetch("/api/images/raw")
      .then(res => res.json())
      .then(data => setAllProperties(data.properties || []))
      .catch(() => {})

    // Load done properties
    fetch("/api/images/done")
      .then(res => res.json())
      .then(data => setDoneProperties(new Set(data.done || [])))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!propertyId) return

    // Load property info
    fetch(`/api/properties/${propertyId}`)
      .then(res => res.json())
      .then(data => setProperty(data))
      .catch(() => {})

    // Load raw images
    fetch(`/api/images/raw/${propertyId}`)
      .then(res => res.json())
      .then(data => {
        setRawImages(data.images || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))

    // Load related properties (same building)
    fetch(`/api/properties/related/${propertyId}`)
      .then(res => res.json())
      .then(data => {
        setRelatedProperties(data.related || [])
      })
      .catch(() => {})
  }, [propertyId])

  const toggleImage = (name: string) => {
    const newSelected = new Set(selectedImages)
    if (newSelected.has(name)) {
      newSelected.delete(name)
    } else {
      newSelected.add(name)
    }
    setSelectedImages(newSelected)
  }

  const selectAll = () => {
    setSelectedImages(new Set(rawImages.map(img => img.name)))
  }

  const selectNone = () => {
    setSelectedImages(new Set())
  }

  const toggleRelated = (id: string) => {
    const newSelected = new Set(selectedRelated)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRelated(newSelected)
  }

  const selectAllRelated = () => {
    setSelectedRelated(new Set(relatedProperties.map(p => p.id)))
  }

  const selectNoneRelated = () => {
    setSelectedRelated(new Set())
  }

  const markDone = async () => {
    try {
      const res = await fetch("/api/images/done", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId })
      })
      if (res.ok) {
        setDoneProperties(new Set([...doneProperties, propertyId]))
        // Find next undone property
        const nextProperty = allProperties.find(p =>
          p.id !== propertyId && !doneProperties.has(p.id)
        )
        if (nextProperty) {
          window.location.href = `/admin/images/${nextProperty.id}`
        }
      }
    } catch (err) {
      console.error("Failed to mark done:", err)
    }
  }

  const unmarkDone = async () => {
    try {
      const res = await fetch("/api/images/done", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId })
      })
      if (res.ok) {
        const newDone = new Set(doneProperties)
        newDone.delete(propertyId)
        setDoneProperties(newDone)
      }
    } catch (err) {
      console.error("Failed to unmark:", err)
    }
  }

  const deleteImage = async (filename: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const res = await fetch(`/api/images/raw/${propertyId}/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename })
      })

      if (res.ok) {
        setRawImages(rawImages.filter(img => img.name !== filename))
        selectedImages.delete(filename)
        setSelectedImages(new Set(selectedImages))
      }
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  const processImages = async () => {
    if (selectedImages.size === 0) {
      setMessage("Valitse ensin kuvat")
      return
    }

    setProcessing(true)
    setMessage("Käsitellään kuvia...")

    try {
      const res = await fetch("/api/images/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          images: Array.from(selectedImages),
          copyToProperties: Array.from(selectedRelated)
        })
      })

      const data = await res.json()

      if (data.success) {
        const copyMsg = data.copiedTo > 0 ? ` Kopioitu ${data.copiedTo} muuhun kohteeseen.` : ""
        setMessage(`Valmis! ${data.processed} kuvaa käsitelty.${copyMsg}`)
        setSelectedImages(new Set())
        setSelectedRelated(new Set())
        // Reload raw images
        const rawRes = await fetch(`/api/images/raw/${propertyId}`)
        const rawData = await rawRes.json()
        setRawImages(rawData.images || [])
      } else {
        setMessage(`Virhe: ${data.error}`)
      }
    } catch (err) {
      setMessage("Käsittely epäonnistui")
    }

    setProcessing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <aside className="w-64 border-r border-border bg-card flex-shrink-0 h-screen sticky top-0 overflow-y-auto">
          <div className="p-4 border-b border-border">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Etusivulle
            </Link>
            <h2 className="font-semibold mt-2">Kohteet</h2>
          </div>
          <nav className="p-2">
            {allProperties.map((p) => (
              <Link
                key={p.id}
                href={`/admin/images/${p.id}`}
                className={`block px-3 py-2 rounded-lg text-sm mb-1 transition ${
                  p.id === propertyId
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                }`}
              >
                <span className="font-medium">#{p.id}</span>
                <span className="text-xs ml-2 opacity-70">
                  {p.imageCount} kuvaa
                </span>
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 p-8">
          <p className="text-muted-foreground">Ladataan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex-shrink-0 h-screen sticky top-0 overflow-y-auto">
        <div className="p-4 border-b border-border">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Etusivulle
          </Link>
          <h2 className="font-semibold mt-2">Kohteet</h2>
          <p className="text-xs text-muted-foreground">
            {allProperties.filter(p => doneProperties.has(p.id)).length} / {allProperties.length} valmis
          </p>
        </div>
        <nav className="p-2">
          {allProperties.map((p) => (
            <Link
              key={p.id}
              href={`/admin/images/${p.id}`}
              className={`block px-3 py-2 rounded-lg text-sm mb-1 transition ${
                p.id === propertyId
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium flex items-center gap-1">
                  {doneProperties.has(p.id) && <span className="text-green-500">✓</span>}
                  #{p.id}
                </span>
                <span className="text-xs opacity-70">
                  {p.imageCount} kuvaa
                </span>
              </div>
              {p.address && (
                <p className={`text-xs truncate mt-0.5 ${
                  p.id === propertyId ? "opacity-80" : "text-muted-foreground"
                }`}>
                  {p.address}
                </p>
              )}
            </Link>
          ))}
          {allProperties.length === 0 && (
            <p className="text-sm text-muted-foreground p-3">
              Ei kuvia dropzonessa
            </p>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="border-b border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">
                Kohde #{propertyId}
              </h1>
              {property && (
                <p className="text-sm text-muted-foreground">{property.address}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {rawImages.length} raakakuvaa
                </p>
                <p className="text-sm font-medium">
                  {selectedImages.size} valittu
                </p>
              </div>
              {doneProperties.has(propertyId) ? (
                <button
                  onClick={unmarkDone}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
                >
                  ✓ Valmis
                </button>
              ) : (
                <button
                  onClick={markDone}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                >
                  Merkitse valmiiksi →
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-8">
        {rawImages.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              Ei raakakuvia. Kopioi kuvat ensin dropzoneen:
            </p>
            <code className="bg-secondary px-4 py-2 rounded text-sm">
              Z:\vuokra-images-raw\{propertyId}\
            </code>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={selectAll}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-secondary"
              >
                Valitse kaikki
              </button>
              <button
                onClick={selectNone}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-secondary"
              >
                Poista valinnat
              </button>
              <div className="flex-1" />
              <button
                onClick={processImages}
                disabled={processing || selectedImages.size === 0}
                className="px-6 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {processing
                  ? "Käsitellään..."
                  : selectedRelated.size > 0
                    ? `Käsittele ${selectedImages.size} kuvaa → ${1 + selectedRelated.size} kohteeseen`
                    : `Käsittele ${selectedImages.size} kuvaa`}
              </button>
            </div>

            {message && (
              <div className="mb-6 p-4 rounded-lg bg-secondary text-sm">
                {message}
              </div>
            )}

            {relatedProperties.length > 0 && (
              <div className="mb-6 p-4 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-medium">
                    Saman talon muut asunnot ({relatedProperties.length})
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllRelated}
                      className="px-3 py-1 text-xs rounded border border-border hover:bg-secondary"
                    >
                      Valitse kaikki
                    </button>
                    <button
                      onClick={selectNoneRelated}
                      className="px-3 py-1 text-xs rounded border border-border hover:bg-secondary"
                    >
                      Poista
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Valitut kuvat kopioidaan myös näihin kohteisiin:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {relatedProperties.map((rel) => (
                    <label
                      key={rel.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                        selectedRelated.has(rel.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRelated.has(rel.id)}
                        onChange={() => toggleRelated(rel.id)}
                        className="w-4 h-4 rounded border-border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{rel.address}</p>
                        <p className="text-xs text-muted-foreground">
                          {rel.size ? `${rel.size} m²` : ""}{rel.size && rel.rent ? " · " : ""}{rel.rent ? `${rel.rent} €/kk` : ""}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                {selectedRelated.size > 0 && (
                  <p className="mt-3 text-sm text-primary font-medium">
                    Kuvat kopioidaan {selectedRelated.size} muuhun kohteeseen
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {rawImages.map((img) => (
                <label
                  key={img.name}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition ${
                    selectedImages.has(img.name)
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedImages.has(img.name)}
                    onChange={() => toggleImage(img.name)}
                    className="sr-only"
                  />
                  <div className="aspect-[4/3] relative bg-muted">
                    <Image
                      src={img.path}
                      alt={img.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      unoptimized
                    />
                    {selectedImages.has(img.name) && (
                      <div className="absolute top-2 right-8 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <button
                      onClick={(e) => deleteImage(img.name, e)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 transition"
                      title="Poista kuva"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-2 bg-card">
                    <p className="text-xs truncate" title={img.name}>
                      {img.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {img.sizeFormatted}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </>
        )}
        </main>
      </div>
    </div>
  )
}
