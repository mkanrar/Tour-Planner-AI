"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import Hero from "@/components/Hero"
import DestinationGrid from "@/components/DestinationGrid"
import SeasonTabs from "@/components/SeasonTabs"
import Features from "@/components/Features"
import Testimonials from "@/components/Testimonials"
import Footer from "@/components/Footer"
import ChatWidget from "@/components/ChatWidget"
import { fetchDestinations, fetchPackages } from "@/lib/api"
import type { Destination, TourPackage } from "@/lib/types"

export default function Home() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [packages, setPackages] = useState<TourPackage[]>([])
  const [chatOpen, setChatOpen] = useState(false)
  const [chatPrefill, setChatPrefill] = useState<string | undefined>()

  useEffect(() => {
    fetchDestinations()
      .then(setDestinations)
      .catch(() => setDestinations([]))
    fetchPackages()
      .then(setPackages)
      .catch(() => setPackages([]))
  }, [])

  const openChat = (prefill?: string) => {
    setChatPrefill(prefill)
    setChatOpen(true)
  }

  return (
    <>
      <Navbar onOpenChat={() => openChat()} />
      <main>
        <Hero onOpenChat={openChat} />
        <DestinationGrid destinations={destinations} onOpenChat={openChat} />
        <SeasonTabs packages={packages} onOpenChat={openChat} />
        <Features />
        <Testimonials />
      </main>
      <Footer />
      <ChatWidget
        isOpen={chatOpen}
        prefill={chatPrefill}
        onOpen={() => setChatOpen(true)}
        onClose={() => { setChatOpen(false); setChatPrefill(undefined) }}
      />
    </>
  )
}
