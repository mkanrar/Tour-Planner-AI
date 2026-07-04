export interface Destination {
  id: string
  name: string
  country: string
  type: "domestic" | "international"
  category: string[]
  seasons: string[]
  image_url: string
  description: string
  price_from: number
  currency: string
  highlights: string[]
}

export interface TourPackage {
  id: string
  destination_id: string
  title: string
  duration_days: number
  season: string
  price: { budget: number; standard: number; luxury: number }
  includes: string[]
  itinerary_summary: string[]
  image_url: string
  highlights: string[]
  group_size: string
}

export interface Accommodation {
  id: string
  destination_id: string
  name: string
  type: "hotel" | "homestay" | "guesthouse" | "resort" | "hostel"
  tier: "budget" | "standard" | "luxury"
  price_per_night: { min: number; max: number; currency: string }
  peak_season_rate?: { min: number; max: number }
  current_rate_note?: string
  last_rate_update?: string
  location: string
  rating: number
  amenities: string[]
  best_for: string[]
  image_url: string
  booking_note: string
  highlights: string
}

export type MessageRole = "user" | "assistant"

export interface ChatMessage {
  role: MessageRole
  content: string
  accommodations?: Accommodation[]
}
