export interface Property {
  id: string
  name: string
  location: string
  area: string
  image: string
  size: number
  rooms: number
  price: number
  status: "available" | "upcoming"
  availableDate?: string
  /** Matterport 3D-kierroksen URL (model ID) */
  matterportUrl?: string
  /** Galleriakuva-polut (esim. /images/1/xxx.jpg). Jos useita, kortilla pyörivä karuselli. */
  gallery?: string[]
}

const niittyporttiGalleryFilenames = [
  "Tähtiniitty as 21-1.JPG",
  "Tähtiniitty as 21-2.JPG",
  "Tähtiniitty as 21-3.JPG",
  "Tähtiniitty as 21-4.JPG",
  "Tähtiniitty as 21-5.JPG",
  "Tähtiniitty as 21-6.JPG",
  "Tähtiniitty as 21-7.JPG",
  "Tähtiniitty as 21-8.JPG",
  "Tähtiniitty as 21-9.JPG",
]
function galleryPaths(filenames: string[], folder: string): string[] {
  return filenames.map((f) => `/images/${folder}/${encodeURIComponent(f)}`)
}
const niittyporttiGallery = galleryPaths(niittyporttiGalleryFilenames, "1")

export const MATTERPORT_MODEL_NIITTYPORTTI = "SQMmpYKKQ7L"
export const MATTERPORT_BASE = "https://my.matterport.com/show"

export function matterportEmbedUrl(modelId: string): string {
  return `${MATTERPORT_BASE}/?m=${modelId}`
}

export const allProperties: Property[] = [
  {
    id: "1",
    name: "Kaksio Niittyportti 2 A 20, Tähtiniitty",
    location: "Tähtiniitty, Espoo",
    area: "Alue A",
    image: `/images/1/${encodeURIComponent("Tähtiniitty as 21-1.JPG")}`,
    size: 61,
    rooms: 2,
    price: 1450,
    status: "available",
    matterportUrl: matterportEmbedUrl(MATTERPORT_MODEL_NIITTYPORTTI),
    gallery: niittyporttiGallery,
  },
  {
    id: "2",
    name: "Valoisa kolmio merinäköalalla",
    location: "Eira",
    area: "Alue A",
    image: "/placeholder.svg",
    size: 78,
    rooms: 3,
    price: 2200,
    status: "upcoming",
    availableDate: "15.3.2026",
  },
  {
    id: "3",
    name: "Kompakti yksiö keskustassa",
    location: "Kamppi",
    area: "Alue B",
    image: "/placeholder.svg",
    size: 32,
    rooms: 1,
    price: 980,
    status: "available",
  },
  {
    id: "4",
    name: "Tilava perheasunto",
    location: "Töölö",
    area: "Alue A",
    image: "/placeholder.svg",
    size: 95,
    rooms: 4,
    price: 2800,
    status: "upcoming",
    availableDate: "1.4.2026",
  },
  {
    id: "5",
    name: "Tyylikäs kaksio Punavuoressa",
    location: "Punavuori",
    area: "Alue B",
    image: "/placeholder.svg",
    size: 48,
    rooms: 2,
    price: 1380,
    status: "available",
  },
  {
    id: "6",
    name: "Rauhallinen asunto puiston laidalla",
    location: "Lauttasaari",
    area: "Alue B",
    image: "/placeholder.svg",
    size: 65,
    rooms: 3,
    price: 1750,
    status: "available",
  },
]
