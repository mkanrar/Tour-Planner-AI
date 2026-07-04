import { Star, MapPin, TrendingUp } from "lucide-react"
import type { Accommodation } from "@/lib/types"

const tierColors = {
  budget:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  standard: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  luxury:   "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
}

const typeLabels: Record<string, string> = {
  hotel:     "Hotel",
  homestay:  "Homestay",
  guesthouse:"Guesthouse",
  resort:    "Resort",
  hostel:    "Hostel",
}

interface AccommodationCardProps {
  accommodation: Accommodation
}

export default function AccommodationCard({ accommodation: a }: AccommodationCardProps) {
  return (
    <div className="flex gap-3 bg-card border border-border rounded-xl shadow-sm p-3 hover:shadow-md hover:border-[#1A4FBF]/30 dark:hover:border-blue-700/40 transition-all">
      {/* Image */}
      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={a.image_url}
          alt={a.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1 mb-1">
          <p className="font-semibold text-foreground text-sm leading-tight truncate">{a.name}</p>
          <div className="flex items-center gap-0.5 shrink-0">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-medium text-foreground">{a.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
          <MapPin className="w-3 h-3 shrink-0" />
          <span className="truncate">{a.location}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tierColors[a.tier]}`}>
            {a.tier.charAt(0).toUpperCase() + a.tier.slice(1)}
          </span>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            {typeLabels[a.type]}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-bold text-[#1A4FBF] dark:text-blue-300">
            ₹{a.price_per_night.min.toLocaleString("en-IN")}–₹{a.price_per_night.max.toLocaleString("en-IN")}
            <span className="font-normal text-muted-foreground">/night</span>
          </p>
          {a.current_rate_note && (
            <div className="flex items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400 shrink-0">
              <TrendingUp className="w-3 h-3" />
              <span>Live rate</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
