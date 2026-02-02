"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        password,
        redirect: false
      })

      if (result?.error) {
        setError("Väärä salasana")
      } else {
        router.push("/admin")
        router.refresh()
      }
    } catch {
      setError("Kirjautuminen epäonnistui")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-[16px] p-8">
          <h1 className="text-xl font-semibold text-center mb-6">
            Admin-kirjautuminen
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Salasana
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Syötä salasana"
                required
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-[12px]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 rounded-[12px] bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? "Kirjaudutaan..." : "Kirjaudu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
