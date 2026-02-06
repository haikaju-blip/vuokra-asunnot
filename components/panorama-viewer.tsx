"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { TourData, TourSweep } from "@/lib/tour-data"

declare global {
  interface Window {
    pannellum: any
  }
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
  const [pannellumReady, setPannellumReady] = useState(false)

  // Load Pannellum from CDN
  useEffect(() => {
    if (window.pannellum) {
      setPannellumReady(true)
      return
    }

    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css"
    document.head.appendChild(link)

    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"
    script.onload = () => setPannellumReady(true)
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(link)
      document.head.removeChild(script)
    }
  }, [])

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

  // Handle scene change
  const handleSceneChange = useCallback(
    (sceneId: string) => {
      if (!tourData) return
      const sweep = tourData.sweeps.find((s) => s.id === sceneId)
      if (sweep) {
        setCurrentSweep(sweep)
        setSweepIndex(tourData.sweeps.indexOf(sweep) + 1)
      }
    },
    [tourData]
  )

  // Initialize Pannellum viewer
  useEffect(() => {
    if (!pannellumReady || !tourData || !containerRef.current || tourData.sweeps.length === 0) return

    const data = tourData

    // Build Pannellum scenes
    const scenes: Record<string, any> = {}

    for (const sweep of data.sweeps) {
      let panoramaUrl: string
      if (sweep.type === "cubemap" && sweep.scanId) {
        panoramaUrl = `/api/tour/${kohde}/panorama?scan=${sweep.scanId}`
      } else if (sweep.panoramaFile) {
        panoramaUrl = `/api/tour/${kohde}/panorama?file=${encodeURIComponent(sweep.panoramaFile)}`
      } else {
        continue
      }

      // Build hotspots for navigation to neighbors
      const hotSpots = sweep.neighbors
        .filter((nId) => data.sweeps.find((s) => s.id === nId))
        .map((neighborId) => {
          const neighbor = data.sweeps.find((s) => s.id === neighborId)!
          const dx = neighbor.position.x - sweep.position.x
          const dy = neighbor.position.y - sweep.position.y
          const yawRad = Math.atan2(dx, dy)
          const yawDeg = yawRad * (180 / Math.PI)

          return {
            pitch: -25,
            yaw: yawDeg,
            type: "scene",
            sceneId: neighborId,
            text: neighbor.label,
            cssClass: "tour-hotspot",
          }
        })

      scenes[sweep.id] = {
        type: "equirectangular",
        panorama: panoramaUrl,
        title: sweep.label,
        hotSpots,
        hfov: 110,
      }
    }

    const startNodeId =
      data.config.startSweep && scenes[data.config.startSweep]
        ? data.config.startSweep
        : data.sweeps[0]?.id

    // Set initial sweep
    const startSweep = data.sweeps.find((s) => s.id === startNodeId)
    if (startSweep) {
      setCurrentSweep(startSweep)
      setSweepIndex(data.sweeps.indexOf(startSweep) + 1)
    }

    const viewer = window.pannellum.viewer(containerRef.current, {
      default: {
        firstScene: startNodeId,
        sceneFadeDuration: 1000,
        autoLoad: true,
        compass: false,
        showControls: false,
        showFullscreenCtrl: false,
        mouseZoom: true,
        keyboardZoom: true,
        draggable: true,
        disableKeyboardCtrl: false,
        friction: 0.15,
        touchPanSpeedCoeffFactor: 1,
        hfov: 110,
        minHfov: 50,
        maxHfov: 120,
      },
      scenes,
    })

    viewerRef.current = viewer

    // Listen for scene changes
    viewer.on("scenechange", (sceneId: string) => {
      handleSceneChange(sceneId)
    })

    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy()
        } catch {
          // ignore
        }
      }
      viewerRef.current = null
    }
  }, [pannellumReady, tourData, kohde, handleSceneChange])

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
      {/* Pannellum container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Top bar: back button + room name */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onBack}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/50 backdrop-blur-sm text-white text-sm hover:bg-black/70 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Takaisin
          </button>

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
