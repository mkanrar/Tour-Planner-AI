"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Farhan Rahman",
    location: "Dhaka, Bangladesh",
    avatar: "https://i.pravatar.cc/80?img=11",
    rating: 5,
    text: "I asked the AI to plan a 5-day trip to Cox's Bazar for my family and it gave a perfect day-by-day itinerary with budget hotels and restaurant suggestions. Saved me hours of research!",
    trip: "Cox's Bazar, 5 Days",
  },
  {
    name: "Priya Sharma",
    location: "Kolkata, India",
    avatar: "https://i.pravatar.cc/80?img=47",
    rating: 5,
    text: "The AI recommended Sajek Valley which I'd never heard of — and it turned out to be the best trip of my life. The homestay suggestion was spot on, hosted by a lovely Chakma family.",
    trip: "Sajek Valley, 3 Days",
  },
  {
    name: "Ahmed Al-Rashid",
    location: "Dubai, UAE",
    avatar: "https://i.pravatar.cc/80?img=33",
    rating: 5,
    text: "Planned a Thailand trip for 7 people in minutes. The AI broke down costs per person, suggested the best season, and even covered visa requirements. Incredible tool.",
    trip: "Thailand, 7 Days",
  },
  {
    name: "Nasrin Akter",
    location: "Chittagong, Bangladesh",
    avatar: "https://i.pravatar.cc/80?img=25",
    rating: 4,
    text: "I had a tight budget and the AI found options that fit perfectly. The Bandarban itinerary was detailed and realistic. Will definitely use TourPlanner again!",
    trip: "Bandarban, 4 Days",
  },
]

export default function Testimonials() {
  return (
    <section className="py-20 px-4 bg-muted">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-[#FF5C5C] font-semibold text-xs tracking-widest uppercase">
            Traveller Stories
          </span>
          <h2
            className="mt-2 text-3xl sm:text-4xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Journeys Worth Sharing
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-md flex flex-col"
            >
              {/* Quote icon */}
              <Quote className="w-6 h-6 text-[#FF5C5C]/50 mb-3" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`w-3.5 h-3.5 ${
                      j < t.rating ? "text-amber-400 fill-amber-400" : "text-border"
                    }`}
                  />
                ))}
              </div>

              <p className="text-foreground/80 text-sm leading-relaxed flex-1 mb-5">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-border"
                  loading="lazy"
                />
                <div>
                  <p className="font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
                <span className="ml-auto text-xs text-[#FF5C5C] font-medium bg-[#FF5C5C]/10 px-2 py-0.5 rounded-full shrink-0">
                  {t.trip}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
