import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Salasana",
      credentials: {
        password: { label: "Salasana", type: "password" }
      },
      async authorize(credentials) {
        const password = credentials?.password as string
        const passwordHash = process.env.ADMIN_PASSWORD_HASH

        if (!password || !passwordHash) {
          return null
        }

        const isValid = await bcrypt.compare(password, passwordHash)

        if (isValid) {
          return { id: "admin", name: "Admin" }
        }

        return null
      }
    })
  ],
  pages: {
    signIn: "/admin/login"
  },
  callbacks: {
    authorized({ auth, request }) {
      const { nextUrl } = request
      const isLoggedIn = !!auth?.user
      const isAdminRoute = nextUrl.pathname.startsWith("/admin")
      const isApiAdminRoute = nextUrl.pathname.startsWith("/api/admin")
      const isLoginPage = nextUrl.pathname === "/admin/login"

      // Tailscale-verkosta (100.x.x.x) pääsee ilman kirjautumista
      const forwardedFor = request.headers.get("x-forwarded-for")
      const realIp = request.headers.get("x-real-ip")
      const clientIp = forwardedFor?.split(",")[0]?.trim() || realIp || ""
      const isTailscale = clientIp.startsWith("100.")

      if (isLoginPage) {
        if (isLoggedIn || isTailscale) {
          return Response.redirect(new URL("/admin", nextUrl))
        }
        return true
      }

      if (isAdminRoute || isApiAdminRoute) {
        if (isLoggedIn || isTailscale) return true
        return false
      }

      return true
    }
  },
  session: {
    strategy: "jwt"
  },
  trustHost: true
})
