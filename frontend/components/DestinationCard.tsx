"use client"

import { motion } from "framer-motion"
import { MapPin } from "lucide-react"
import type { Destination } from "@/lib/types"

interface DestinationCardProps {
  destination: Destination
  onExplore: (name: string) => void
}

const categoryColors: Record<string, string> = {
  Beach:    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Mountain: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Cultural: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  Adventure:"bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  Luxury:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Nature:   "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  Wildlife: "bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300",
  Family:   "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  Romantic: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  Spiritual:"bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  Shopping: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  Trekking: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
}

export default function DestinationCard({ destination, onExplore }: DestinationCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.22 }}
      className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 bg-card border border-border cursor-pointer"
      onClick={() => onExplore(destination.name)}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={destination.image_url}
          alt={destination.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />

        {/* Type badge */}
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
            destination.type === "domestic"
              ? "bg-[#1A4FBF]/90 text-white"
              : "bg-[#FF5C5C]/90 text-white"
          }`}
        >
          {destination.type === "domestic" ? "Domestic" : "International"}
        </span>

        {/* Price */}
        <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-card/90 text-[#1A4FBF] dark:text-blue-300 text-xs font-bold px-2.5 py-1 rounded-full">
          From ₹{destination.price_from.toLocaleString("en-IN")}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3
          className="font-bold text-foreground text-lg leading-tight mb-1"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {destination.name}
        </h3>
        <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-3">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span>{destination.country}</span>
        </div>

        {/* Category tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {destination.category.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                categoryColors[cat] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {cat}
            </span>
          ))}
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 mb-4">
          {destination.description}
        </p>

        <button
          onClick={(e) => { e.stopPropagation(); onExplore(destination.name) }}
          className="w-full py-2 text-sm font-semibold text-[#1A4FBF] dark:text-blue-300 border border-[#1A4FBF] dark:border-blue-600 rounded-full hover:bg-[#1A4FBF] hover:text-white dark:hover:bg-blue-700 dark:hover:text-white transition-colors duration-200"
        >
          Explore with AI
        </button>
      </div>
    </motion.div>
  )
}
