import { readFile, readdir, stat } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

// --- Types ---

export type PanoramaType = "cubemap" | "equirectangular"

export interface TourSweep {
  id: string
  index: number
  label: string
  scanId?: string
  panoramaFile?: string
  type: PanoramaType
  position: { x: number; y: number }
  neighbors: string[]
  hidden: boolean
}

export interface TourConfig {
  startSweep: string
  hiddenSweeps: string[]
  sweepLabels: Record<string, string>
}

export interface TourData {
  name: string
  kohde: string
  sweeps: TourSweep[]
  config: TourConfig
}

// --- Matterport skybox face mapping ---
// skybox0=top, skybox1=front, skybox2=left, skybox3=back, skybox4=right, skybox5=bottom

export const SKYBOX_FACE_MAP: Record<number, string> = {
  0: "top",
  1: "front",
  2: "left",
  3: "back",
  4: "right",
  5: "bottom",
}

// --- Paths ---

const DROPZONE_BASE = "/srv/shared/DROPZONE"

export function getKohdeDir(kohde: string): string {
  return join(DROPZONE_BASE, kohde)
}

function getSpaceDataPath(kohde: string): string {
  return join(getKohdeDir(kohde), "space-data.json")
}

function getTourConfigPath(kohde: string): string {
  return join(getKohdeDir(kohde), "tour-config.json")
}

function getOwnPanoramasDir(kohde: string): string {
  return join(getKohdeDir(kohde), "own-panoramas")
}

function getRawPhotosDir(kohde: string): string {
  return join(getKohdeDir(kohde), "raw-photos")
}

// --- Space data (Matterport) ---

interface MatterportSweep {
  index: number
  id: string
  position: { x: number; y: number; z: number }
  room: { id: string | null; label: string; tags: string[] }
  scan_id: string
  panorama_files: Record<string, string>
}

interface MatterportSpaceData {
  model_id: string
  name: string
  total_area_m2: number
  rooms: Array<{ id: string; label: string; tags: string[] }>
  sweeps: MatterportSweep[]
  sweep_count: number
}

// --- Config ---

export async function loadTourConfig(kohde: string): Promise<TourConfig> {
  const configPath = getTourConfigPath(kohde)
  const defaults: TourConfig = {
    startSweep: "",
    hiddenSweeps: [],
    sweepLabels: {},
  }

  if (!existsSync(configPath)) return defaults

  try {
    const raw = await readFile(configPath, "utf-8")
    const parsed = JSON.parse(raw)
    return { ...defaults, ...parsed }
  } catch {
    return defaults
  }
}

export async function saveTourConfig(kohde: string, config: TourConfig): Promise<void> {
  const { writeFile, mkdir } = await import("fs/promises")
  const dir = getKohdeDir(kohde)
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true })
  }
  const configPath = getTourConfigPath(kohde)
  await writeFile(configPath, JSON.stringify(config, null, 2), "utf-8")
}

// --- Neighbor calculation ---

function calculateNeighbors(sweeps: Array<{ id: string; position: { x: number; y: number } }>): Map<string, string[]> {
  const neighbors = new Map<string, string[]>()
  const MAX_DISTANCE = 3.0 // meters
  const MAX_NEIGHBORS = 4 // max arrows per sweep

  for (const sweep of sweeps) {
    const nearby: Array<{ id: string; dist: number }> = []

    for (const other of sweeps) {
      if (other.id === sweep.id) continue
      const dx = other.position.x - sweep.position.x
      const dy = other.position.y - sweep.position.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 0.1 && dist <= MAX_DISTANCE) { // Skip distance 0 (duplicate positions)
        nearby.push({ id: other.id, dist })
      }
    }

    // Sort by distance and take closest N
    nearby.sort((a, b) => a.dist - b.dist)
    neighbors.set(sweep.id, nearby.slice(0, MAX_NEIGHBORS).map((n) => n.id))
  }

  return neighbors
}

// --- Load tour data ---

export async function loadTourData(kohde: string): Promise<TourData | null> {
  const kohdeDir = getKohdeDir(kohde)
  if (!existsSync(kohdeDir)) return null

  const config = await loadTourConfig(kohde)
  const sweeps: TourSweep[] = []

  // Try Matterport space-data first
  const spaceDataPath = getSpaceDataPath(kohde)
  if (existsSync(spaceDataPath)) {
    try {
      const raw = await readFile(spaceDataPath, "utf-8")
      const spaceData: MatterportSpaceData = JSON.parse(raw)

      // Build sweep list
      const sweepPositions = spaceData.sweeps.map((s) => ({
        id: s.id,
        position: { x: s.position.x, y: s.position.y },
      }))
      const neighborMap = calculateNeighbors(sweepPositions)

      for (const s of spaceData.sweeps) {
        const label = config.sweepLabels[s.id] || s.room?.label || `Piste ${s.index + 1}`
        sweeps.push({
          id: s.id,
          index: s.index,
          label,
          scanId: s.scan_id,
          type: "cubemap",
          position: { x: s.position.x, y: s.position.y },
          neighbors: neighborMap.get(s.id) || [],
          hidden: config.hiddenSweeps.includes(s.id),
        })
      }

      // Set default start sweep if not set
      if (!config.startSweep && sweeps.length > 0) {
        config.startSweep = sweeps[0].id
      }

      return {
        name: spaceData.name || kohde,
        kohde,
        sweeps,
        config,
      }
    } catch (e) {
      console.error("Error loading space data:", e)
    }
  }

  // Try own panoramas
  const ownDir = getOwnPanoramasDir(kohde)
  if (existsSync(ownDir)) {
    try {
      const files = await readdir(ownDir)
      const panoramas = files.filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f)).sort()

      for (let i = 0; i < panoramas.length; i++) {
        const file = panoramas[i]
        const id = file.replace(/\.[^.]+$/, "")
        const label = config.sweepLabels[id] || id.replace(/-/g, " ").replace(/^\d+-\s*/, "")

        sweeps.push({
          id,
          index: i,
          label: label.charAt(0).toUpperCase() + label.slice(1),
          panoramaFile: file,
          type: "equirectangular",
          position: { x: i * 2, y: 0 }, // Linear layout for own panoramas
          neighbors: [],
          hidden: config.hiddenSweeps.includes(id),
        })
      }

      // For equirectangular, chain neighbors sequentially
      for (let i = 0; i < sweeps.length; i++) {
        const neighbors: string[] = []
        if (i > 0) neighbors.push(sweeps[i - 1].id)
        if (i < sweeps.length - 1) neighbors.push(sweeps[i + 1].id)
        sweeps[i].neighbors = neighbors
      }

      if (!config.startSweep && sweeps.length > 0) {
        config.startSweep = sweeps[0].id
      }

      return {
        name: kohde.replace(/-/g, " "),
        kohde,
        sweeps,
        config,
      }
    } catch (e) {
      console.error("Error loading own panoramas:", e)
    }
  }

  return null
}

// --- Raw photos info (for admin) ---

export interface RawPhotoRoom {
  name: string
  imageCount: number
  hasStitchedResult: boolean
}

export async function getRawPhotoRooms(kohde: string): Promise<RawPhotoRoom[]> {
  const rawDir = getRawPhotosDir(kohde)
  const ownDir = getOwnPanoramasDir(kohde)
  const rooms: RawPhotoRoom[] = []

  if (!existsSync(rawDir)) return rooms

  try {
    const entries = await readdir(rawDir)
    for (const entry of entries) {
      const entryPath = join(rawDir, entry)
      const entryStat = await stat(entryPath)
      if (!entryStat.isDirectory()) continue

      const files = await readdir(entryPath)
      const images = files.filter((f) => /\.(jpg|jpeg|dng|png)$/i.test(f))

      const stitchedPath = join(ownDir, `${entry}.jpg`)
      rooms.push({
        name: entry,
        imageCount: images.length,
        hasStitchedResult: existsSync(stitchedPath),
      })
    }
  } catch {
    // ignore
  }

  return rooms.sort((a, b) => a.name.localeCompare(b.name, "fi"))
}
