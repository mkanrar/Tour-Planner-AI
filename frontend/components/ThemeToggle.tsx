"use client"

import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    // Sync with the class that was applied by the inline script
    setDark(document.documentElement.classList.contains("dark"))
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("tourplanner_theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("tourplanner_theme", "light")
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200
        hover:bg-white/15 hover:scale-110 active:scale-95
        dark:hover:bg-white/10"
    >
      {dark ? (
        <Sun className="w-4.5 h-4.5 text-amber-300" />
      ) : (
        <Moon className="w-4.5 h-4.5 text-white" />
      )}
    </button>
  )
}
