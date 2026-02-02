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
  matterportUrl?: string
  gallery?: string[]
  public?: boolean
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
  balcony: boolean | null
  rent: number
  landlord: string
  contract_status: string
  status: string
  matterport: string | null
  images: string[]
  public: boolean
  notes: string | null
}

export const MATTERPORT_BASE = "https://my.matterport.com/show"

export function matterportEmbedUrl(modelId: string): string {
  return `${MATTERPORT_BASE}/?m=${modelId}`
}

/** Fetch all properties from API */
export async function fetchProperties(): Promise<Property[]> {
  const res = await fetch("/api/properties", { cache: "no-store" })
  if (!res.ok) throw new Error("Failed to fetch properties")
  return res.json()
}

/** Fetch single property from API */
export async function fetchProperty(id: string): Promise<Property | null> {
  const res = await fetch(`/api/properties/${id}`, { cache: "no-store" })
  if (res.status === 404) return null
  if (!res.ok) throw new Error("Failed to fetch property")
  return res.json()
}
