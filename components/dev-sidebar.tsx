"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

const DEV_LINKS = [
  { label: "Etusivu", href: "/" },
  { label: "Meistä", href: "/meista" },
  { label: "—", href: "" },
  { label: "Kohde 4", href: "/kohde/isokatu-60-b52" },
  { label: "Kohde 39", href: "/kohde/niittyportti-2-a13" },
  { label: "Kohde 40", href: "/kohde/niittyportti-2-a20" },
  { label: "—", href: "" },
  { label: "Admin", href: "/admin" },
  { label: "Admin: Kohde 39", href: "/admin/properties/niittyportti-2-a13" },
  { label: "Admin: Kuvat 39", href: "/admin/images/39" },
  { label: "Admin: Vuokralaiset", href: "/admin/tenants" },
  { label: "Admin: Sopimukset", href: "/admin/contracts" },
]

export function DevSidebar() {
  const searchParams = useSearchParams()
  const isDev = searchParams.get("dev") === "true"

  if (!isDev) return null

  return (
    <aside className="fixed right-0 top-0 h-screen w-48 bg-black/90 text-white p-4 z-50 overflow-y-auto">
      <div className="text-xs font-bold text-yellow-400 mb-3">DEV MENU</div>
      <nav className="space-y-1">
        {DEV_LINKS.map((link, i) =>
          link.href === "" ? (
            <div key={i} className="border-t border-white/20 my-2" />
          ) : (
            <Link
              key={i}
              href={`${link.href}?dev=true`}
              className="block text-sm py-1 px-2 rounded hover:bg-white/20 transition"
            >
              {link.label}
            </Link>
          )
        )}
      </nav>
      <div className="mt-4 pt-4 border-t border-white/20">
        <Link
          href="/"
          className="block text-xs text-red-400 hover:text-red-300"
        >
          ✕ Sulje dev-mode
        </Link>
      </div>
    </aside>
  )
}
