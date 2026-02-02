import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ELEA asunnot – Löydä unelmiesi koti",
  description: "Selaa vapaita ja pian vapautuvia ELEA-asuntoja. Selkeä tie kotiin.",
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
