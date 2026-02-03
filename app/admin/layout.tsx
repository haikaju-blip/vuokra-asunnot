"use client"

import { usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/admin/login"

  // Login-sivu ei käytä sivupalkkia
  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
