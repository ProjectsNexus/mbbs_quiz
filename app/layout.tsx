import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/hooks/use-auth"
import { ThemeProvider } from "@/hooks/use-theme"
import { Suspense } from "react"
import { TutorProvider } from "@/hooks/use-tutor"
import "./globals.css"

export const metadata: Metadata = {
  title: "SilvRx - Medical Education Platform",
  description: "Comprehensive MBBS quiz application for medical students",
  generator: "https://muhammadsaif.is-great.net/",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        <Suspense fallback={null}>
          <ThemeProvider>
            <AuthProvider>
              <TutorProvider>{children}</TutorProvider>
            </AuthProvider>
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
