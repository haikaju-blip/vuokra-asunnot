"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { TourData, TourSweep } from "@/lib/tour-data"

// PSV CSS
import "@photo-sphere-viewer/core/index.css"
import "@photo-sphere-viewer/markers-plugin/index.css"
import "@photo-sphere-viewer/virtual-tour-plugin/index.css"

// Matterport skybox face mapping: skybox0=top, 1=front, 2=left, 3=back, 4=right, 5=bottom
function buildCubemapUrls(kohde: string, scanId: string, res: string = "2k") {
  const base = `/api/tour/${kohde}/panorama?scan=${scanId}&res=${res}`
  return {
    top: `${base}&face=0`,
    front: `${base}&face=1`,
    left: `${base}&face=2`,
    back: `${base}&face=3`,
    right: `${base}&face=4`,
    bottom: `${base}&face=5`,
  }
}

function buildEquirectangularUrl(kohde: string, file: string) {
  return `/api/tour/${kohde}/panorama?file=${encodeURIComponent(file)}`
}

interface PanoramaViewerProps {
  kohde: string
  onBack?: () => void
}

export function PanoramaViewer({ kohde, onBack }: PanoramaViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const [tourData, setTourData] = useState<TourData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSweep, setCurrentSweep] = useState<TourSweep | null>(null)
  const [sweepIndex, setSweepIndex] = useState(0)
  const [totalSweeps, setTotalSweeps] = useState(0)

  // Load tour data
  useEffect(() => {
    fetch(`/api/tour/${kohde}`)
      .then((res) => {
        if (!res.ok) throw new Error("Tour data not found")
        return res.json()
      })
      .then((data: TourData) => {
        setTourData(data)
        setTotalSweeps(data.sweeps.length)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [kohde])

  // Initialize PSV viewer
  useEffect(() => {
    if (!tourData || !containerRef.current || tourData.sweeps.length === 0) return

    // Capture for closure
    const data = tourData

    let viewer: any = null
    let destroyed = false

    async function init() {
      // Dynamic imports to avoid SSR issues
      const { Viewer } = await import("@photo-sphere-viewer/core")
      const { CubemapAdapter } = await import("@photo-sphere-viewer/cubemap-adapter")
      const { VirtualTourPlugin } = await import("@photo-sphere-viewer/virtual-tour-plugin")
      const { MarkersPlugin } = await import("@photo-sphere-viewer/markers-plugin")

      if (destroyed || !containerRef.current) return

      // Determine if we need cubemap adapter
      const hasCubemap = data.sweeps.some((s) => s.type === "cubemap")

      // Build PSV nodes from tour sweeps
      const nodes = data.sweeps.map((sweep) => {
        // Build panorama data based on type
        let panorama: any
        if (sweep.type === "cubemap" && sweep.scanId) {
          panorama = buildCubemapUrls(kohde, sweep.scanId, "2k")
        } else if (sweep.panoramaFile) {
          panorama = buildEquirectangularUrl(kohde, sweep.panoramaFile)
        }

        // Build links from neighbors
        const links = sweep.neighbors
          .filter((nId) => data.sweeps.find((s) => s.id === nId))
          .map((neighborId) => {
            const neighbor = data.sweeps.find((s) => s.id === neighborId)!
            const dx = neighbor.position.x - sweep.position.x
            const dy = neighbor.position.y - sweep.position.y
            const yaw = Math.atan2(dx, dy)

            return {
              nodeId: neighborId,
              position: { yaw, pitch: -0.1 },
            }
          })

        // Thumbnail: use cubemap front face or equirectangular
        let thumbnail: string | undefined
        if (sweep.type === "cubemap" && sweep.scanId) {
          thumbnail = `/api/tour/${kohde}/panorama?scan=${sweep.scanId}&res=low&face=1`
        }

        return {
          id: sweep.id,
          panorama,
          name: sweep.label,
          caption: sweep.label,
          thumbnail,
          links,
        }
      })

      const startNodeId =
        data.config.startSweep &&
        nodes.find((n) => n.id === data.config.startSweep)
          ? data.config.startSweep
          : nodes[0]?.id

      // Create viewer
      const plugins: any[] = [
        MarkersPlugin,
        [
          VirtualTourPlugin,
          {
            dataMode: "client",
            positionMode: "manual",
            renderMode: "3d",
            nodes,
            startNodeId,
            preload: true,
            transitionOptions: {
              showLoader: true,
              speed: "20rpm",
              effect: "fade",
              rotation: true,
            },
          },
        ],
      ]

      viewer = new Viewer({
        container: containerRef.current!,
        adapter: hasCubemap ? CubemapAdapter : undefined,
        plugins,
        navbar: false,
        loadingTxt: "Ladataan...",
        touchmoveTwoFingers: false,
        mousewheelCtrlKey: false,
        defaultYaw: 0,
        defaultPitch: 0,
      })

      viewerRef.current = viewer

      // Track node changes
      const virtualTour = viewer.getPlugin(VirtualTourPlugin) as any
      if (virtualTour) {
        virtualTour.addEventListener("node-changed", (e: any) => {
          const nodeId = e.node?.id
          const sweep = data.sweeps.find((s) => s.id === nodeId)
          if (sweep) {
            setCurrentSweep(sweep)
            setSweepIndex(data.sweeps.indexOf(sweep) + 1)
          }
        })
      }

      // Set initial sweep
      const startSweep = data.sweeps.find((s) => s.id === startNodeId)
      if (startSweep) {
        setCurrentSweep(startSweep)
        setSweepIndex(data.sweeps.indexOf(startSweep) + 1)
      }
    }

    init()

    return () => {
      destroyed = true
      if (viewer) {
        try {
          viewer.destroy()
        } catch {
          // ignore
        }
      }
      viewerRef.current = null
    }
  }, [tourData, kohde])

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-elea-bg flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-elea-warm border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-elea-text-muted text-sm">Ladataan kierrosta...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !tourData) {
    return (
      <div className="fixed inset-0 bg-elea-bg flex items-center justify-center z-50">
        <div className="text-center max-w-sm px-4">
          <p className="text-elea-navy font-semibold mb-2">Kierrosta ei löytynyt</p>
          <p className="text-elea-text-muted text-sm mb-4">
            {error || "Kohdetta ei löydy"}
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-lg bg-elea-navy text-white text-sm hover:opacity-90 transition"
            >
              Takaisin
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* PSV container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Overlay UI */}

      {/* Top bar: back button + room name */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Back button */}
          <button
            onClick={onBack}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/50 backdrop-blur-sm text-white text-sm hover:bg-black/70 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Takaisin
          </button>

          {/* Room name */}
          {currentSweep && (
            <div className="pointer-events-auto px-3 py-2 rounded-lg bg-black/50 backdrop-blur-sm text-white text-sm font-medium">
              {currentSweep.label}
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar: sweep counter */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex items-center justify-center px-4 py-3">
          <div className="pointer-events-auto px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white/80 text-xs">
            {sweepIndex} / {totalSweeps}
          </div>
        </div>
      </div>
    </div>
  )
}
