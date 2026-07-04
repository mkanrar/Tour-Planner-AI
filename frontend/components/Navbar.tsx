"use client"

import { useState, useEffect } from "react"
import { Menu, X, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import ThemeToggle from "./ThemeToggle"

interface NavbarProps {
  onOpenChat: () => void
}

const links = [
  { label: "Home", href: "#home" },
  { label: "Destinations", href: "#destinations" },
  { label: "Seasons", href: "#seasons" },
  { label: "About", href: "#about" },
]

export default function Navbar({ onOpenChat }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-[#1A4FBF] flex items-center justify-center shadow-md">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span
              className={`text-xl font-bold tracking-tight transition-colors ${
                scrolled ? "text-foreground" : "text-white"
              }`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              TourPlanner
            </span>
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-colors hover:text-[#FF5C5C] ${
                  scrolled ? "text-foreground/80" : "text-white/90"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right: Theme toggle + CTA */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <Button
              onClick={onOpenChat}
              className="bg-[#FF5C5C] hover:bg-[#e84f4f] text-white border-none rounded-full px-5 shadow-md"
              size="sm"
            >
              Plan My Trip
            </Button>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <ThemeToggle />
            <button
              className={`p-2 rounded-md transition-colors ${
                scrolled ? "text-foreground" : "text-white"
              }`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-card border border-border rounded-xl mb-3 py-3 px-2 space-y-1 shadow-lg">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-4 py-2.5 text-sm font-medium text-foreground/80 rounded-lg hover:bg-muted hover:text-[#FF5C5C] transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="px-4 pt-2">
              <Button
                onClick={() => { setMenuOpen(false); onOpenChat() }}
                className="w-full bg-[#FF5C5C] hover:bg-[#e84f4f] text-white border-none rounded-full"
                size="sm"
              >
                Plan My Trip
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
