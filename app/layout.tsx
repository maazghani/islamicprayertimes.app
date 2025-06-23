import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "Islamic Prayer Times",
  description: "Beautiful Islamic prayer times app with accurate location-based calculations",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="lilac-blue"
          enableSystem={false}
          themes={["lilac-blue", "lilac-purple"]}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
