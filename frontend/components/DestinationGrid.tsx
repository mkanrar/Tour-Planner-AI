"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import DestinationCard from "./DestinationCard"
import { Skeleton } from "@/components/ui/skeleton"
import type { Destination } from "@/lib/types"

interface DestinationGridProps {
  destinations: Destination[]
  onOpenChat: (prefill?: string) => void
}

const filters = ["All", "Domestic", "International", "Beach", "Mountain", "Cultural", "Adventure"]

export default function DestinationGrid({ destinations, onOpenChat }: DestinationGridProps) {
  const [activeFilter, setActiveFilter] = useState("All")

  const filtered = destinations.filter((d) => {
    if (activeFilter === "All") return true
    if (activeFilter === "Domestic") return d.type === "domestic"
    if (activeFilter === "International") return d.type === "international"
    return d.category.includes(activeFilter)
  })

  return (
    <section id="destinations" className="py-20 px-4 bg-muted">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-[#FF5C5C] font-semibold text-xs tracking-widest uppercase">
            Explore Destinations
          </span>
          <h2
            className="mt-2 text-3xl sm:text-4xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Where Will You Go Next?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm">
            From the world&apos;s longest sea beach to the peaks of the Himalayas — discover
            destinations for every traveler and every budget.
          </p>
        </motion.div>

        {/* Filter pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === f
                  ? "bg-[#1A4FBF] text-white shadow-md"
                  : "bg-card text-muted-foreground border border-border hover:border-[#1A4FBF] hover:text-[#1A4FBF]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filtered.map((dest, i) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <DestinationCard
                destination={dest}
                onExplore={(name) =>
                  onOpenChat(`Tell me about ${name} and suggest a tour plan`)
                }
              />
            </motion.div>
          ))}
        </motion.div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-16">
            No destinations match this filter.
          </p>
        )}
      </div>
    </section>
  )
}

export function DestinationGridSkeleton() {
  return (
    <section className="py-20 px-4 bg-muted">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-card border border-border shadow-md">
              <Skeleton className="h-52 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
