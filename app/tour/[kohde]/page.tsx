import { Metadata } from "next"
import { loadTourData } from "@/lib/tour-data"
import { TourPageClient } from "./tour-page-client"

interface Props {
  params: Promise<{ kohde: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kohde } = await params
  const tourData = await loadTourData(kohde)

  const title = tourData
    ? `360° kierros – ${tourData.name}`
    : "360° virtuaalikierros"

  return {
    title: `${title} | ELEA asunnot`,
    description: tourData
      ? `Tutustu kohteeseen ${tourData.name} interaktiivisella 360° virtuaalikierroksella. ${tourData.sweeps.filter((s) => !s.hidden).length} panoraamapistettä.`
      : "Interaktiivinen 360° virtuaalikierros",
    openGraph: {
      title,
      description: tourData
        ? `Tutustu kohteeseen ${tourData.name} 360° virtuaalikierroksella`
        : "360° virtuaalikierros",
      type: "website",
      locale: "fi_FI",
      siteName: "ELEA asunnot",
    },
  }
}

export default async function TourPage({ params }: Props) {
  const { kohde } = await params
  return <TourPageClient kohde={kohde} />
}
