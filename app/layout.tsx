import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Kohteet – Löydä unelmiesi koti",
  description: "Selaa vapaita ja pian vapautuvia asuntoja. Moderni vuokra-asuntojen esittely.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fi">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
