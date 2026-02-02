"use client"

import { useEffect, useState } from "react"
import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"

// Fix Leaflet default marker icon issue in Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface PropertyMapProps {
  address: string
  name: string
  lat?: number
  lng?: number
}

export function PropertyMap({ address, name, lat, lng }: PropertyMapProps) {
  const [mounted, setMounted] = useState(false)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat, lng } : null
  )
  const [loading, setLoading] = useState(!coordinates)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Geocode address if coordinates not provided
  useEffect(() => {
    if (coordinates || !address) return

    const geocodeAddress = async () => {
      try {
        // Use Nominatim (OpenStreetMap) for geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
          {
            headers: {
              "User-Agent": "ELEA-Asunnot/1.0",
            },
          }
        )
        const data = await response.json()

        if (data && data.length > 0) {
          setCoordinates({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          })
        } else {
          setError("Sijaintia ei löytynyt")
        }
      } catch (err) {
        console.error("Geocoding error:", err)
        setError("Sijainnin haku epäonnistui")
      } finally {
        setLoading(false)
      }
    }

    geocodeAddress()
  }, [address, coordinates])

  if (!mounted) {
    return (
      <div className="w-full h-full bg-muted rounded-[16px] flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Ladataan karttaa...</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full h-full bg-muted rounded-[16px] flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Haetaan sijaintia...</span>
      </div>
    )
  }

  if (error || !coordinates) {
    return (
      <div className="w-full h-full bg-muted rounded-[16px] flex items-center justify-center">
        <span className="text-muted-foreground text-sm">{error || "Sijaintia ei voitu näyttää"}</span>
      </div>
    )
  }

  return (
    <MapContainer
      center={[coordinates.lat, coordinates.lng]}
      zoom={15}
      scrollWheelZoom={false}
      className="w-full h-full rounded-[16px] z-0"
      style={{ minHeight: "300px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[coordinates.lat, coordinates.lng]} icon={defaultIcon}>
        <Popup>
          <strong>{name}</strong>
          <br />
          {address}
        </Popup>
      </Marker>
    </MapContainer>
  )
}
