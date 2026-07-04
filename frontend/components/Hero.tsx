"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, ChevronDown } from "lucide-react"

interface HeroProps {
  onOpenChat: (prefill?: string) => void
}

const slides = [
  {
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop",
    title: "World's Longest Sea Beach",
    subtitle: "Cox's Bazar, Bangladesh",
  },
  {
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1600&auto=format&fit=crop",
    title: "Turquoise Lagoons & Luxury",
    subtitle: "Maldives",
  },
  {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&auto=format&fit=crop",
    title: "Queen of the Hills",
    subtitle: "Sajek Valley, Bangladesh",
  },
]

export default function Hero({ onOpenChat }: HeroProps) {
  const [current, setCurrent] = useState(0)
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const text = query.trim()
    onOpenChat(text ? `I want to plan a trip to ${text}` : undefined)
    setQuery("")
  }

  return (
    <section id="home" className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Background images */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.image}
            alt={slide.subtitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-widest uppercase bg-[#FF6B6B]/90 text-white rounded-full">
            AI-Powered Travel Planning
          </span>
          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Explore the World,
            <br />
            <span className="text-[#FF6B6B]">Your Way</span>
          </h1>
          <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-8">
            Tell our AI where you dream of going. Get a custom itinerary,
            curated stays, and a plan that fits your budget — in seconds.
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-xl"
        >
          <div className="flex items-center bg-white rounded-full shadow-2xl overflow-hidden pl-5 pr-2 py-2">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Where do you want to go? e.g. Cox's Bazar, Bali..."
              className="flex-1 px-3 text-gray-800 text-sm outline-none bg-transparent placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="bg-[#0B3D91] hover:bg-[#0a3480] text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
            >
              Plan Trip
            </button>
          </div>
        </motion.form>

        {/* Slide indicators */}
        <div className="flex gap-2 mt-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-[#FF6B6B]" : "w-1.5 bg-white/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <a href="#destinations" aria-label="Scroll down">
            <ChevronDown className="w-7 h-7 text-white/70" />
          </a>
        </motion.div>
      </div>

      {/* Auto-advance slides */}
      <SlideTimer current={current} total={slides.length} onNext={setCurrent} />
    </section>
  )
}

function SlideTimer({
  current,
  total,
  onNext,
}: {
  current: number
  total: number
  onNext: (n: number) => void
}) {
  useEffect(() => {
    const t = setInterval(() => onNext((current + 1) % total), 5000)
    return () => clearInterval(t)
  }, [current, total, onNext])
  return null
}
