"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

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

export default function AdminDashboard() {
  const [properties, setProperties] = useState<AdminProperty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/properties")
      .then((res) => res.json())
      .then((data) => {
        setProperties(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Ladataan...</p>
      </div>
    )
  }

  const available = properties.filter(p => p.status === "available" && p.public)
  const rented = properties.filter(p => p.status === "rented" && p.public)
  const hidden = properties.filter(p => !p.public)

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-semibold mb-8">Kohteiden hallinta</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-[16px] p-5">
          <p className="text-sm text-muted-foreground mb-1">Vapaana</p>
          <p className="text-3xl font-semibold text-green-600">{available.length}</p>
        </div>
        <div className="bg-card border border-border rounded-[16px] p-5">
          <p className="text-sm text-muted-foreground mb-1">Vuokrattu</p>
          <p className="text-3xl font-semibold text-blue-600">{rented.length}</p>
        </div>
        <div className="bg-card border border-border rounded-[16px] p-5">
          <p className="text-sm text-muted-foreground mb-1">Piilotettu</p>
          <p className="text-3xl font-semibold text-muted-foreground">{hidden.length}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-card border border-border rounded-[16px] p-6 mb-8">
        <h2 className="font-semibold mb-4">Toiminnot</h2>
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/admin/tenants"
            className="px-4 py-2 rounded-[12px] border border-border hover:bg-secondary transition text-sm"
          >
            Vuokralaiset
          </Link>
          <Link
            href="/admin/contracts"
            className="px-4 py-2 rounded-[12px] border border-border hover:bg-secondary transition text-sm"
          >
            Sopimukset
          </Link>
          <Link
            href="/admin/images/1"
            className="px-4 py-2 rounded-[12px] border border-border hover:bg-secondary transition text-sm"
          >
            Kuvien hallinta
          </Link>
        </div>
      </div>

      {/* Recent / needs attention */}
      {available.length > 0 && (
        <div className="bg-card border border-border rounded-[16px] p-6">
          <h2 className="font-semibold mb-4">Vapaat kohteet ({available.length})</h2>
          <div className="space-y-2">
            {available.slice(0, 10).map((p) => (
              <Link
                key={p.id}
                href={`/admin/properties/${p.id}`}
                className="flex items-center justify-between p-3 rounded-[12px] hover:bg-secondary transition"
              >
                <div>
                  <p className="text-sm font-medium">
                    <span className="text-muted-foreground">{p.db_id}</span>
                    <span className="text-muted-foreground mx-1">·</span>
                    {p.address}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.area_m2 && `${p.area_m2} m²`}
                    {p.area_m2 && p.rooms && " · "}
                    {p.rooms && `${p.rooms}h`}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {p.rent > 0 ? `${p.rent} €/kk` : "-"}
                </p>
              </Link>
            ))}
            {available.length > 10 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                + {available.length - 10} muuta
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
