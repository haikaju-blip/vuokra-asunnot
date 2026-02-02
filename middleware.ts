import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

function isTailscaleIP(request: NextRequest): boolean {
  // Tarkista kaikki mahdolliset IP-headerit
  const forwardedFor = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")

  // X-Forwarded-For voi sisältää useita IP-osoitteita pilkulla erotettuna
  let clientIp = forwardedFor?.split(",")[0]?.trim() || realIp || ""

  // Poista IPv6-mapped prefix (::ffff:)
  if (clientIp.startsWith("::ffff:")) {
    clientIp = clientIp.slice(7)
  }

  // Tailscale käyttää 100.x.x.x osoitteita (CGNAT-alue 100.64.0.0/10)
  const isTailscale = clientIp.startsWith("100.")

  // Debug-loki
  console.log(`[Middleware] IP: ${clientIp}, Tailscale: ${isTailscale}, Path: ${request.nextUrl.pathname}`)

  return isTailscale
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Tarkista onko Tailscale-verkosta
  if (isTailscaleIP(request)) {
    // Tailscale-verkosta pääsee suoraan adminiin
    // Jos yritetään login-sivulle, ohjaa dashboardiin
    if (pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
    // Muuten päästä läpi
    return NextResponse.next()
  }

  // Ei-Tailscale: käytä NextAuth-autentikointia
  return (auth as any)(request)
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
}
