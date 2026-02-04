import { readFileSync, existsSync, readdirSync } from "fs"
import { join } from "path"

/** Frontend property type */
export interface Property {
  id: string
  db_id: number
  name: string
  address: string
  location: string
  area: string
  image: string
  size: number
  rooms: number
  price: number
  status: "available" | "upcoming"
  availableDate?: string
  neighborhood?: string
  matterportUrl?: string
  gallery?: string[]
  public?: boolean
  // Kohdesivun lisäkentät
  floor?: number
  totalFloors?: number
  balcony?: boolean
  yearBuilt?: number
  highlights?: string[]
  description?: string
}

/** Raw property from JSON database */
export interface RawProperty {
  db_id: number
  id: string
  address: string
  city: string
  area_m2: number | null
  rooms: number | null
  floor: number | null
  total_floors?: number | null
  balcony: boolean | null
  rent: number
  landlord: string
  contract_status: string
  status: string
  available_date?: string | null
  neighborhood?: string | null
  matterport: string | null
  images: string[]
  public: boolean
  notes: string | null
  year_built?: number | null
  highlights?: string[] | null
  description?: string | null
}

export const MATTERPORT_BASE = "https://my.matterport.com/show"

export function matterportEmbedUrl(modelId: string): string {
  return `${MATTERPORT_BASE}/?m=${modelId}`
}

/** Fetch all properties from API */
export async function fetchProperties(): Promise<Property[]> {
  const res = await fetch("/api/properties", { cache: "no-store", credentials: "include" })
  if (!res.ok) throw new Error("Failed to fetch properties")
  return res.json()
}

/** Fetch single property from API */
export async function fetchProperty(id: string): Promise<Property | null> {
  const res = await fetch(`/api/properties/${id}`, { cache: "no-store", credentials: "include" })
  if (res.status === 404) return null
  if (!res.ok) throw new Error("Failed to fetch property")
  return res.json()
}

// ============================================
// SERVER-SIDE FUNCTIONS (for SSR/SSG)
// ============================================

const DATA_PATH = join(process.cwd(), "..", "..", "data", "properties.json")
const IMAGES_DIR = join(process.cwd(), "public", "images")

function getProcessedImages(dbId: number): string[] {
  const folder = join(IMAGES_DIR, String(dbId))
  if (!existsSync(folder)) return []
  try {
    const files = readdirSync(folder)
    const baseNames = new Set<string>()
    for (const file of files) {
      const match = file.match(/^(\d+)-\w+\.webp$/)
      if (match) baseNames.add(match[1])
    }
    return Array.from(baseNames).sort()
  } catch {
    return []
  }
}

function formatAvailableDate(isoDate: string | null | undefined): string | undefined {
  if (!isoDate) return undefined
  try {
    const date = new Date(isoDate)
    return `${date.getDate()}.${date.getMonth() + 1}.${String(date.getFullYear()).slice(-2)}`
  } catch {
    return undefined
  }
}

function transformRawProperty(raw: RawProperty): Property {
  const matterportUrl = raw.matterport ? `${MATTERPORT_BASE}/?m=${raw.matterport}` : undefined
  const status = raw.status === "available" ? "available" : "upcoming"
  const availableDate = formatAvailableDate(raw.available_date)
  const addressParts = raw.address.split(/\s+\d{5}\s+/)
  const name = addressParts[0] || raw.address
  const processedImages = getProcessedImages(raw.db_id)
  const gallery = processedImages.map(base => `/images/${raw.db_id}/${base}`)

  return {
    id: raw.id,
    db_id: raw.db_id,
    name,
    address: raw.address,
    location: raw.city,
    area: raw.city,
    image: gallery[0] ? `${gallery[0]}-large.webp` : "/placeholder.svg",
    size: raw.area_m2 || 0,
    rooms: raw.rooms || 0,
    price: raw.rent || 0,
    status,
    availableDate,
    neighborhood: raw.neighborhood || undefined,
    matterportUrl,
    gallery: gallery.length ? gallery : undefined,
    public: raw.public,
    floor: raw.floor || undefined,
    totalFloors: raw.total_floors || undefined,
    balcony: raw.balcony || undefined,
    yearBuilt: raw.year_built || undefined,
    highlights: raw.highlights || undefined,
    description: raw.description || undefined,
  }
}

/** Server-side: Get all public properties directly from JSON file */
export function getProperties(): Property[] {
  try {
    const data = readFileSync(DATA_PATH, "utf-8")
    const rawProperties: RawProperty[] = JSON.parse(data)
    return rawProperties
      .filter(p => p.public === true)
      .map(transformRawProperty)
  } catch (error) {
    console.error("Error reading properties:", error)
    return []
  }
}

/** Server-side: Get single property by ID */
export function getProperty(id: string): Property | null {
  try {
    const data = readFileSync(DATA_PATH, "utf-8")
    const rawProperties: RawProperty[] = JSON.parse(data)
    const raw = rawProperties.find(p => p.id === id)
    if (!raw) return null
    return transformRawProperty(raw)
  } catch (error) {
    console.error("Error reading property:", error)
    return null
  }
}
