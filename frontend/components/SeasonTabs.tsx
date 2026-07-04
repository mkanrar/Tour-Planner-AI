"use client"

import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import PackageCard from "./PackageCard"
import type { TourPackage } from "@/lib/types"

interface SeasonTabsProps {
  packages: TourPackage[]
  onOpenChat: (prefill?: string) => void
}

const seasons = ["Winter", "Spring", "Summer", "Autumn"]

const seasonMeta: Record<string, { emoji: string; desc: string; lightBg: string; darkBg: string }> = {
  Winter: {
    emoji: "❄️",
    desc: "Cool misty mornings, perfect beach weather, and wildlife at its finest.",
    lightBg: "bg-blue-50 border-blue-100",
    darkBg: "dark:bg-blue-950/30 dark:border-blue-900/40",
  },
  Spring: {
    emoji: "🌸",
    desc: "Blooming landscapes, lush greenery, and ideal trekking conditions.",
    lightBg: "bg-pink-50 border-pink-100",
    darkBg: "dark:bg-pink-950/30 dark:border-pink-900/40",
  },
  Summer: {
    emoji: "☀️",
    desc: "Vibrant festivals, hill station retreats, and monsoon adventures.",
    lightBg: "bg-amber-50 border-amber-100",
    darkBg: "dark:bg-amber-950/30 dark:border-amber-900/40",
  },
  Autumn: {
    emoji: "🍂",
    desc: "Crystal-clear skies, golden foliage, and the best mountain views.",
    lightBg: "bg-orange-50 border-orange-100",
    darkBg: "dark:bg-orange-950/30 dark:border-orange-900/40",
  },
}

export default function SeasonTabs({ packages, onOpenChat }: SeasonTabsProps) {
  return (
    <section id="seasons" className="py-20 px-4 bg-background">
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
            Season-Based Tours
          </span>
          <h2
            className="mt-2 text-3xl sm:text-4xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            The Right Trip, Right Season
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm">
            Every season unveils a different side of the world. Pick your season and discover
            handpicked tours curated for that time of year.
          </p>
        </motion.div>

        <Tabs defaultValue="Winter">
          <TabsList className="flex flex-wrap justify-center gap-2 bg-transparent h-auto mb-10">
            {seasons.map((s) => (
              <TabsTrigger
                key={s}
                value={s}
                className="px-5 py-2 rounded-full text-sm font-medium
                  data-[state=active]:bg-[#1A4FBF] data-[state=active]:text-white
                  data-[state=inactive]:bg-card data-[state=inactive]:text-muted-foreground
                  data-[state=inactive]:border data-[state=inactive]:border-border
                  border-none shadow-none"
              >
                {seasonMeta[s].emoji} {s}
              </TabsTrigger>
            ))}
          </TabsList>

          {seasons.map((season) => {
            const meta = seasonMeta[season]
            const seasonPkgs = packages.filter((p) => p.season === season)

            return (
              <TabsContent key={season} value={season}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className={`rounded-2xl border p-5 mb-8 flex items-center gap-4 ${meta.lightBg} ${meta.darkBg}`}>
                    <span className="text-4xl">{meta.emoji}</span>
                    <div>
                      <h3 className="font-bold text-foreground">{season} Travel</h3>
                      <p className="text-sm text-muted-foreground">{meta.desc}</p>
                    </div>
                    <button
                      onClick={() =>
                        onOpenChat(`What are the best places to visit in ${season.toLowerCase()}?`)
                      }
                      className="ml-auto shrink-0 px-4 py-1.5 bg-[#1A4FBF] text-white text-xs font-semibold rounded-full hover:bg-[#1641a0] transition-colors"
                    >
                      Ask AI
                    </button>
                  </div>

                  {seasonPkgs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {seasonPkgs.map((pkg, i) => (
                        <motion.div
                          key={pkg.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                        >
                          <PackageCard
                            pkg={pkg}
                            onPlanClick={(title) =>
                              onOpenChat(
                                `I'm interested in the "${title}" package. Tell me more and help me plan it.`
                              )
                            }
                          />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      No packages for this season yet. Ask our AI for recommendations!
                    </div>
                  )}
                </motion.div>
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </section>
  )
}
