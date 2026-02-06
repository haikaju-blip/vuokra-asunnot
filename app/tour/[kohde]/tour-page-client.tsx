"use client"

import { useRouter } from "next/navigation"
import { PanoramaViewer } from "@/components/panorama-viewer"

interface Props {
  kohde: string
}

export function TourPageClient({ kohde }: Props) {
  const router = useRouter()

  return (
    <PanoramaViewer
      kohde={kohde}
      onBack={() => router.back()}
    />
  )
}
