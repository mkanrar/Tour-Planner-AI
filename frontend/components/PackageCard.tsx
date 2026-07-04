"use client"

import { motion } from "framer-motion"
import { Clock, Users, CheckCircle2 } from "lucide-react"
import type { TourPackage } from "@/lib/types"

interface PackageCardProps {
  pkg: TourPackage
  onPlanClick: (title: string) => void
}

export default function PackageCard({ pkg, onPlanClick }: PackageCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group bg-card border border-border rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pkg.image_url}
          alt={pkg.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span
            className="text-white font-bold text-base leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {pkg.title}
          </span>
          <span className="bg-[#FF5C5C] text-white text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ml-2">
            {pkg.duration_days}D
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {pkg.duration_days} Days
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {pkg.group_size} pax
          </span>
        </div>

        {/* Includes */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {pkg.includes.map((item) => (
            <span
              key={item}
              className="flex items-center gap-1 text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full"
            >
              <CheckCircle2 className="w-3 h-3" />
              {item}
            </span>
          ))}
        </div>

        {/* Highlights */}
        <ul className="space-y-1 mb-4 flex-1">
          {pkg.highlights.slice(0, 3).map((h) => (
            <li key={h} className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C5C] shrink-0" />
              {h}
            </li>
          ))}
        </ul>

        {/* Price row */}
        <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded-xl">
          <div>
            <p className="text-xs text-muted-foreground">Budget (per person)</p>
            <p className="text-[#1A4FBF] dark:text-blue-300 font-bold text-lg">
              ₹{pkg.price.budget.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Standard</p>
            <p className="text-foreground font-semibold text-sm">
              ₹{pkg.price.standard.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <button
          onClick={() => onPlanClick(pkg.title)}
          className="w-full py-2 bg-[#1A4FBF] hover:bg-[#1641a0] text-white text-sm font-semibold rounded-full transition-colors duration-200"
        >
          Chat to Plan
        </button>
      </div>
    </motion.div>
  )
}
