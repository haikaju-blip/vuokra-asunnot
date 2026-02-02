"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"

interface AdminProperty {
  id: string
  db_id: number
  address: string
  city: string
  status: string
  rent: number
  public: boolean
  area_m2: number | null
  rooms: number | null
}

type StatusFilter = "all" | "available" | "rented" | "hidden"

export default function AdminDashboard() {
  const [properties, setProperties] = useState<AdminProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>("all")

  useEffect(() => {
    fetch("/api/admin/properties")
      .then((res) => res.json())
      .then((data) => {
        setProperties(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredProperties = properties.filter((p) => {
    if (filter === "all") return true
    if (filter === "available") return p.status === "available"
    if (filter === "rented") return p.status === "rented"
    if (filter === "hidden") return !p.public
    return true
  })

  const counts = {
    all: properties.length,
    available: properties.filter((p) => p.status === "available").length,
    rented: properties.filter((p) => p.status === "rented").length,
    hidden: properties.filter((p) => !p.public).length
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <p className="text-muted-foreground">Ladataan...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Kohteiden hallinta</h1>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/images/1"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Kuvien hallinta
              </Link>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Etusivulle
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-2 rounded-[12px] border border-border hover:bg-secondary transition"
              >
                Kirjaudu ulos
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(
            [
              { key: "all", label: "Kaikki" },
              { key: "available", label: "Vapaat" },
              { key: "rented", label: "Vuokratut" },
              { key: "hidden", label: "Piilotetut" }
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 text-sm rounded-[12px] border transition ${
                filter === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:bg-secondary"
              }`}
            >
              {label} ({counts[key]})
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-[16px] overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  #
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Osoite
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Alue
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Vuokra
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Julkinen
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Toiminnot
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {property.db_id}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{property.address}</p>
                    {(property.area_m2 || property.rooms) && (
                      <p className="text-xs text-muted-foreground">
                        {property.area_m2 && `${property.area_m2} m²`}
                        {property.area_m2 && property.rooms && " · "}
                        {property.rooms && `${property.rooms}h`}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{property.city}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={property.status} />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {property.rent > 0 ? `${property.rent} €/kk` : "-"}
                  </td>
                  <td className="px-4 py-3">
                    {property.public ? (
                      <span className="text-sm text-green-600">Kyllä</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Ei</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/properties/${property.id}`}
                        className="text-sm px-3 py-1 rounded-[8px] border border-border hover:bg-secondary transition"
                      >
                        Muokkaa
                      </Link>
                      <Link
                        href={`/admin/images/${property.db_id}`}
                        className="text-sm px-3 py-1 rounded-[8px] border border-border hover:bg-secondary transition"
                      >
                        Kuvat
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProperties.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Ei kohteita tällä suodattimella
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    available: "bg-green-100 text-green-700",
    rented: "bg-blue-100 text-blue-700",
    hidden: "bg-muted text-muted-foreground"
  }

  const labels: Record<string, string> = {
    available: "Vapaa",
    rented: "Vuokrattu",
    hidden: "Piilotettu"
  }

  return (
    <span
      className={`inline-block px-2 py-1 text-xs rounded-[6px] ${
        styles[status] || styles.hidden
      }`}
    >
      {labels[status] || status}
    </span>
  )
}
