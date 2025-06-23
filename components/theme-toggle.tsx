"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="text-muted-text">
        <Palette className="w-5 h-5" />
      </Button>
    )
  }

  const toggleTheme = () => {
    setTheme(theme === "lilac-blue" ? "lilac-purple" : "lilac-blue")
  }

  const currentThemeName = theme === "lilac-blue" ? "Lilac Blue" : "Lilac Purple"
  const nextThemeName = theme === "lilac-blue" ? "Lilac Purple" : "Lilac Blue"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-muted-text hover:text-primary-text transition-colors relative group"
      title={`Switch to ${nextThemeName} theme`}
    >
      <Palette className="w-5 h-5" />
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-primary-text text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {currentThemeName}
      </div>
    </Button>
  )
}
