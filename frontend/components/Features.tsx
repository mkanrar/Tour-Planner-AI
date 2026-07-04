"use client"

import { motion } from "framer-motion"
import { Bot, BadgeDollarSign, Clock, MapPinned, Users, ShieldCheck } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "AI Trip Planning",
    desc: "Our GPT-4o powered agent creates fully personalised itineraries based on your budget, dates, and preferences.",
    color: "bg-blue-500/20 text-blue-300",
  },
  {
    icon: BadgeDollarSign,
    title: "Best Price Guarantee",
    desc: "We suggest options across budget, standard, and luxury tiers so you always get the most for your money.",
    color: "bg-emerald-500/20 text-emerald-300",
  },
  {
    icon: Clock,
    title: "24/7 AI Support",
    desc: "Have a question at midnight? Our AI assistant is always online to help plan, adjust, or answer queries.",
    color: "bg-purple-500/20 text-purple-300",
  },
  {
    icon: MapPinned,
    title: "Curated Itineraries",
    desc: "Each plan includes day-by-day activities, local tips, food recommendations, and hidden gems.",
    color: "bg-orange-500/20 text-orange-300",
  },
  {
    icon: Users,
    title: "Group & Solo Friendly",
    desc: "Whether you're a solo backpacker or planning a family trip for 20, we tailor plans for any group size.",
    color: "bg-pink-500/20 text-pink-300",
  },
  {
    icon: ShieldCheck,
    title: "Verified Accommodations",
    desc: "Every hotel and homestay we suggest is vetted for quality, safety, and value — no surprises on arrival.",
    color: "bg-teal-500/20 text-teal-300",
  },
]

export default function Features() {
  return (
    <section id="about" className="py-20 px-4 bg-[#0A1628] dark:bg-[#060C18]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-[#FF5C5C] font-semibold text-xs tracking-widest uppercase">
            Why TourPlanner
          </span>
          <h2
            className="mt-2 text-3xl sm:text-4xl font-bold text-white"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Travel Smarter, Not Harder
          </h2>
          <p className="mt-3 text-blue-300/80 max-w-xl mx-auto text-sm">
            We combine AI intelligence with local expertise to make every journey
            seamless, affordable, and unforgettable.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white/5 hover:bg-white/8 backdrop-blur-sm rounded-2xl p-6 border border-white/8 transition-colors duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-blue-200/70 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
