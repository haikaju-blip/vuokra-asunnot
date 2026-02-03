"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

interface AdminProperty {
  id: string
  db_id: number
  address: string
  city: string
  status: string
  public: boolean
}

interface GroupedProperties {
  [city: string]: AdminProperty[]
}

function extractStreetAddress(fullAddress: string): string {
  // "Merikoskenkatu 1 as9 90500 Oulu" -> "Merikoskenkatu 1 as9"
  const parts = fullAddress.split(" ")
  const filtered = parts.filter(p => !/^\d{5}$/.test(p) && !["Oulu", "Vantaa", "Helsinki", "Espoo", "Tampere", "Turku"].includes(p))
  return filtered.join(" ")
}

export function AdminSidebar() {
  const [properties, setProperties] = useState<AdminProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const pathname = usePathname()

  useEffect(() => {
    fetch("/api/admin/properties")
      .then((res) => res.json())
      .then((data: AdminProperty[]) => {
        setProperties(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const toggleCity = (city: string) => {
    const next = new Set(collapsed)
    if (next.has(city)) {
      next.delete(city)
    } else {
      next.add(city)
    }
    setCollapsed(next)
  }

  // Ryhmittele kaupungeittain ja järjestä osoitteen mukaan
  const grouped: GroupedProperties = {}
  for (const p of properties) {
    if (!grouped[p.city]) grouped[p.city] = []
    grouped[p.city].push(p)
  }

  // Järjestä kaupungit aakkosjärjestykseen
  const cities = Object.keys(grouped).sort()

  // Järjestä kohteet osoitteen mukaan
  for (const city of cities) {
    grouped[city].sort((a, b) => a.address.localeCompare(b.address, "fi"))
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" })
  }

  // Tunnista aktiivinen kohde
  const activeId = pathname?.match(/\/admin\/(?:properties|images)\/([^/]+)/)?.[1]

  return (
    <aside className="w-72 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-semibold text-lg">Admin</h1>
          <button
            onClick={handleLogout}
            className="text-xs px-2 py-1 rounded border border-border hover:bg-secondary transition"
          >
            Ulos
          </button>
        </div>
        <div className="flex gap-3 text-xs">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition"
          >
            Etusivu →
          </Link>
          <Link
            href="/admin/tenants"
            className={`transition ${pathname?.startsWith("/admin/tenants") ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
          >
            Vuokralaiset
          </Link>
          <Link
            href="/admin/contracts"
            className={`transition ${pathname?.startsWith("/admin/contracts") ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}
          >
            Sopimukset
          </Link>
        </div>
      </div>

      {/* Properties list */}
      <nav className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <p className="text-sm text-muted-foreground p-2">Ladataan...</p>
        ) : (
          cities.map((city) => (
            <div key={city} className="mb-2">
              {/* City header */}
              <button
                onClick={() => toggleCity(city)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition"
              >
                <span>{city}</span>
                <span className="flex items-center gap-1">
                  <span className="text-[10px] font-normal normal-case">
                    {grouped[city].length}
                  </span>
                  <svg
                    className={`w-3 h-3 transition-transform ${collapsed.has(city) ? "-rotate-90" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>

              {/* Properties */}
              {!collapsed.has(city) && (
                <div className="space-y-0.5">
                  {grouped[city].map((p) => {
                    const isActive = activeId === p.id || activeId === String(p.db_id)
                    const street = extractStreetAddress(p.address)

                    return (
                      <Link
                        key={p.id}
                        href={`/admin/properties/${p.id}`}
                        className={`block px-2 py-1.5 rounded-lg text-sm transition ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-secondary"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {/* Status indicator */}
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              !p.public
                                ? "bg-muted-foreground/40"
                                : p.status === "available"
                                  ? "bg-green-500"
                                  : "bg-blue-500"
                            }`}
                            title={!p.public ? "Piilotettu" : p.status === "available" ? "Vapaa" : "Vuokrattu"}
                          />
                          <span className="truncate">{street}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </nav>

      {/* Footer stats */}
      <div className="p-3 border-t border-border flex-shrink-0 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Yhteensä</span>
          <span>{properties.length} kohdetta</span>
        </div>
        <div className="flex gap-3 mt-1">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {properties.filter(p => p.status === "available" && p.public).length}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {properties.filter(p => p.status === "rented" && p.public).length}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            {properties.filter(p => !p.public).length}
          </span>
        </div>
      </div>
    </aside>
  )
}
