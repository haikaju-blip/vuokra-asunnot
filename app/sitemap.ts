import { MetadataRoute } from "next"
import { getProperties } from "@/lib/properties"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://asunnot.elea.fi"
  const properties = getProperties()

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...properties.map((p) => ({
      url: `${baseUrl}/kohde/${p.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ]
}
