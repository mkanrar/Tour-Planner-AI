# Tour Planner — Project Plan & Requirements

## Project Overview

A single-page AI-powered Tour Planner website where users can browse beautiful domestic and international tour packages (curated by season) and interact with an embedded AI Agent to create personalized tour itineraries based on their specific requirements.

---

## Goals

- Showcase domestic and international tour destinations with rich visuals
- Present season-based tour recommendations to inspire travelers
- Provide an intelligent AI chat agent that understands travel requirements and generates custom itineraries
- Suggest curated budget hotels and homestays per destination with tier-based pricing
- Deliver a seamless, modern single-page experience

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 14+ (App Router)            |
| Styling     | Tailwind CSS + shadcn/ui components |
| AI Chat UI  | Custom React chat widget            |
| Backend API | Python (FastAPI)                    |
| AI Engine   | OpenAI GPT-4o (via API key)         |
| Image CDN   | Unsplash API or static public assets|
| Deployment  | Vercel (frontend) + Railway/Render (Python API) |

---

## Architecture

```
┌─────────────────────────────────────┐
│         Next.js Frontend            │
│  ┌────────────────────────────────┐  │
│  │  Hero / Tour Gallery Section   │  │
│  │  Season-based Tour Cards       │  │
│  │  AI Chat Widget (floating)     │  │
│  └────────────────────┬───────────┘  │
└───────────────────────┼─────────────┘
                        │ HTTP POST (webhook)
                        ▼
┌─────────────────────────────────────┐
│       Python FastAPI Backend        │
│  ┌────────────────────────────────┐  │
│  │  /api/chat  — AI Agent route   │  │
│  │  /api/tours — Tour data route  │  │
│  │  OpenAI GPT-4o integration     │  │
│  │  Conversation history mgmt     │  │
│  │  Tour knowledge base (JSON)    │  │
│  └────────────────────────────────┘  │
└─────────────────────────────────────┘
                        │
                        ▼
              OpenAI GPT-4o API
```

---

## Page Sections (Single Page Layout)

### 1. Navbar
- Logo + Brand name "TourPlanner"
- Navigation links: Home, Destinations, Seasons, About
- "Plan My Trip" CTA button → scrolls to chat or opens chat widget
- Sticky on scroll

### 2. Hero Section
- Full-width background video or high-quality image slider
- Headline: "Explore the World with AI-Powered Planning"
- Subheadline: short tagline
- Search bar (destination input) → opens AI chat with pre-filled prompt
- Scroll-down indicator

### 3. Featured Destinations
- Grid/masonry layout with 8–12 destination cards
- Mix of domestic (Cox's Bazar, Sundarbans, Sajek, Bandarban, Sylhet, etc.) and international (Maldives, Thailand, Bali, Paris, Dubai, etc.)
- Each card: image, destination name, country/region, tag (Beach / Mountain / Cultural / Adventure), price-from badge
- Hover: subtle zoom + overlay with short description
- "Explore" button per card

### 4. Season-Based Tour Plans
- Tabbed or carousel layout with 4 seasonal categories: Spring, Summer, Autumn, Winter
- Each season shows 3–4 recommended packages
- Package card: image, title, duration (e.g., 5D/4N), highlights list, estimated budget, "Chat to Plan" CTA

### 5. Why Choose Us (Features Strip)
- 4–6 icons with short text: AI Planning, 24/7 Support, Best Price, Curated Itineraries, Group & Solo options, Verified Partners

### 6. Testimonials
- 3–4 testimonial cards with avatar, name, rating stars, and review text

### 7. AI Chat Widget
- Floating button (bottom-right corner) — opens full chat panel
- Panel: conversation history, message input, "Send" button, typing indicator
- Pre-suggested prompts (e.g., "Plan a 5-day beach trip", "Best places in winter under $500", "Suggest budget hotels in Cox's Bazar", "Find a homestay in Sajek")
- Clear chat button
- Chat history persisted in localStorage (session-based)

### 8. Footer
- Quick links, social icons, contact info, copyright

---

## AI Agent — Capabilities & Behavior

### System Prompt
The agent is briefed as an expert travel consultant with knowledge of:
- Popular domestic destinations (Bangladesh focus)
- International destinations worldwide
- Seasonal travel patterns and weather
- Budget planning (budget / mid-range / luxury tiers)
- Visa requirements (general guidance)
- Accommodation types: budget hotels, mid-range hotels, luxury resorts, homestays, guesthouses
- Day-by-day itinerary building
- Recommending accommodation options with estimated per-night rates, amenities, and booking tips

### Supported User Intents
| Intent                       | Example Query                                                    |
|------------------------------|------------------------------------------------------------------|
| Destination suggestion       | "Where should I go in December with family?"                     |
| Itinerary generation         | "Plan a 7-day trip to Thailand for 2 people, $1000"              |
| Budget breakdown             | "How much will a Cox's Bazar trip cost for 4 people?"            |
| Season recommendation        | "Best time to visit Maldives?"                                   |
| Activity suggestion          | "Adventure activities in Bandarban"                              |
| Visa & logistics             | "Do I need a visa for Dubai from Bangladesh?"                    |
| Package comparison           | "Compare beach vs mountain trip in winter"                       |
| Hotel suggestion             | "Suggest budget hotels in Cox's Bazar under $30/night"           |
| Homestay suggestion          | "Any homestays available in Sajek or Bandarban?"                 |
| Accommodation with itinerary | "Plan 5 days in Sylhet and suggest where to stay each night"     |

### OpenAI Integration
- Model: `gpt-4o`
- Feature: **Function Calling** (Tools) for structured responses
- Defined tool functions:
  - `search_destinations(query, season, type)` — returns matching destinations from knowledge base
  - `generate_itinerary(destination, days, budget, travelers, preferences)` — returns day-by-day plan
  - `get_package_info(destination)` — returns pricing and package details
  - `get_season_recommendations(season, budget_range)` — top picks for a season
  - `suggest_accommodations(destination, type, budget_per_night, travelers)` — returns curated hotels and homestays matching the criteria
- Conversation memory: last 10 messages passed as context to maintain continuity
- Streaming responses: enabled for real-time typing effect in chat UI

---

## Python FastAPI Backend

### Project Structure
```
backend/
├── main.py                  # FastAPI app entry point
├── routers/
│   ├── chat.py              # POST /api/chat
│   ├── tours.py             # GET /api/tours, GET /api/tours/{id}
│   └── accommodations.py    # GET /api/accommodations, GET /api/accommodations/{destination}
├── agents/
│   └── tour_agent.py        # OpenAI GPT-4o agent logic + tools
├── data/
│   ├── destinations.json        # Destination data
│   ├── packages.json            # Tour package data by season
│   └── accommodations.json      # Hotels and homestays per destination
├── models/
│   └── schemas.py           # Pydantic request/response models
├── .env                     # OPENAI_API_KEY, CORS_ORIGINS
└── requirements.txt
```

### Key API Endpoints
| Method | Endpoint                          | Description                                            |
|--------|-----------------------------------|--------------------------------------------------------|
| POST   | /api/chat                         | Accepts message + history, returns AI response         |
| GET    | /api/tours                        | Returns all tour packages                              |
| GET    | /api/tours/{id}                   | Returns a single tour package                          |
| GET    | /api/destinations                 | Returns destination list with filters                  |
| GET    | /api/accommodations               | Returns all accommodations (filterable)                |
| GET    | /api/accommodations/{destination} | Returns hotels & homestays for a specific destination  |
| GET    | /health                           | Health check                                           |

### Request / Response Shape

**POST /api/chat**
```json
// Request
{
  "message": "Plan a 5 day trip to Cox's Bazar",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "session_id": "uuid-string"
}

// Response (streaming or JSON)
{
  "reply": "Here is your 5-day Cox's Bazar itinerary...",
  "suggestions": ["Tell me the budget breakdown", "Suggest budget hotels", "Find a homestay nearby"],
  "destinations_referenced": ["Cox's Bazar"]
}
```

---

## Next.js Frontend

### Project Structure
```
frontend/
├── app/
│   ├── layout.tsx           # Root layout (fonts, metadata)
│   ├── page.tsx             # Single page — all sections
│   └── globals.css
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── DestinationGrid.tsx
│   ├── DestinationCard.tsx
│   ├── SeasonTabs.tsx
│   ├── PackageCard.tsx
│   ├── Features.tsx
│   ├── Testimonials.tsx
│   ├── ChatWidget.tsx        # Floating AI chat button + panel
│   ├── ChatMessage.tsx       # Individual message bubble
│   ├── AccommodationCard.tsx # Hotel / homestay card shown inside chat or as inline result
│   └── Footer.tsx
├── lib/
│   ├── api.ts               # Fetch wrapper for Python backend
│   └── types.ts             # TypeScript interfaces
├── public/
│   └── images/              # Static tour images
├── .env.local               # NEXT_PUBLIC_API_URL
└── package.json
```

### Environment Variables
```
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000

# backend/.env
OPENAI_API_KEY=sk-...
CORS_ORIGINS=http://localhost:3000
```

---

## Data Model

### Destination
```json
{
  "id": "coxs-bazar",
  "name": "Cox's Bazar",
  "country": "Bangladesh",
  "type": "domestic",
  "category": ["Beach", "Family"],
  "seasons": ["Winter", "Autumn"],
  "image_url": "...",
  "description": "World's longest sea beach...",
  "price_from": 150,
  "currency": "USD",
  "highlights": ["Sea Beach", "Himchhari Falls", "Inani Beach"]
}
```

### Tour Package
```json
{
  "id": "pkg-coxs-bazar-5d",
  "destination_id": "coxs-bazar",
  "title": "Cox's Bazar Explorer",
  "duration_days": 5,
  "season": "Winter",
  "price": { "budget": 200, "standard": 350, "luxury": 700 },
  "includes": ["Hotel", "Transport", "Guide"],
  "itinerary_summary": ["Day 1: Arrival...", "Day 2: ..."],
  "image_url": "..."
}
```

### Accommodation (Hotel / Homestay)
```json
{
  "id": "hotel-long-beach-coxs-bazar",
  "destination_id": "coxs-bazar",
  "name": "Long Beach Hotel",
  "type": "hotel",
  "tier": "budget",
  "price_per_night": { "min": 20, "max": 35, "currency": "USD" },
  "location": "Kolatoli Beach Road, Cox's Bazar",
  "rating": 3.8,
  "amenities": ["Free WiFi", "AC", "Restaurant", "Sea View"],
  "best_for": ["Solo", "Couple", "Budget Traveler"],
  "image_url": "...",
  "booking_note": "Direct walk-in or call ahead; no online booking",
  "highlights": "Walking distance to the main beach strip"
}
```

```json
{
  "id": "homestay-sajek-hillview",
  "destination_id": "sajek",
  "name": "Sajek Hill View Homestay",
  "type": "homestay",
  "tier": "budget",
  "price_per_night": { "min": 10, "max": 18, "currency": "USD" },
  "location": "Ruiilui Para, Sajek Valley",
  "rating": 4.5,
  "amenities": ["Home-cooked meals", "Scenic terrace", "Local guide available"],
  "best_for": ["Backpacker", "Group", "Cultural experience"],
  "image_url": "...",
  "booking_note": "Book at least 3 days in advance via phone",
  "highlights": "Hosted by indigenous Chakma family; authentic local experience"
}
```

**Accommodation Tiers:**
| Tier       | Price/Night (approx USD) | Description                             |
|------------|--------------------------|-----------------------------------------|
| `budget`   | $5 – $35                 | Guesthouses, homestays, basic hotels    |
| `standard` | $35 – $100               | 3-star hotels, comfortable amenities    |
| `luxury`   | $100+                    | 4–5 star resorts, premium experience    |

**Accommodation Types:**
- `hotel` — Commercial hotel property
- `homestay` — Family-hosted accommodation with local experience
- `guesthouse` — Small privately-run lodge
- `resort` — Full-service leisure resort
- `hostel` — Dormitory / shared room option for backpackers

---

## UI / Design Guidelines

- **Color Palette**: Deep ocean blue `#0B3D91`, warm coral `#FF6B6B`, clean white `#FFFFFF`, soft sand `#F5F0E8`
- **Typography**: `Playfair Display` (headings), `Inter` (body)
- **Animations**: Framer Motion — fade-in on scroll, card hover effects, chat panel slide-in
- **Responsive**: Mobile-first, breakpoints at sm/md/lg/xl
- **Accessibility**: WCAG AA contrast, keyboard navigable chat, aria labels

---

## Development Phases

### Phase 1 — Foundation
- [ ] Initialize Next.js frontend project
- [ ] Initialize Python FastAPI backend project
- [ ] Set up Tailwind CSS + shadcn/ui
- [ ] Configure CORS between frontend and backend
- [ ] Create static destination and package data (JSON)
- [ ] Create accommodations.json with hotels and homestays for each destination

### Phase 2 — Frontend UI
- [ ] Build Navbar, Hero, DestinationGrid sections
- [ ] Build Season Tabs + Package Cards
- [ ] Build Features strip and Testimonials
- [ ] Build Footer
- [ ] Add Framer Motion animations

### Phase 3 — AI Chat Widget
- [ ] Build floating ChatWidget component
- [ ] Build ChatMessage bubble component
- [ ] Wire up to Python /api/chat endpoint
- [ ] Implement streaming response rendering
- [ ] Add suggested quick-prompt chips (include accommodation prompts)
- [ ] Render inline `AccommodationCard` components when agent returns hotel/homestay results
- [ ] Persist session history in localStorage

### Phase 4 — AI Agent (Backend)
- [ ] Define OpenAI function tools (search, itinerary, packages, accommodations)
- [ ] Implement `suggest_accommodations` tool — filter by destination, type (hotel/homestay), tier, budget/night
- [ ] Implement tour_agent.py with GPT-4o + function calling
- [ ] Implement conversation history management
- [ ] Test all user intent scenarios including hotel and homestay queries

### Phase 5 — Integration & Polish
- [ ] Connect all frontend components to backend APIs
- [ ] Add loading skeletons, error states
- [ ] SEO metadata, Open Graph tags
- [ ] Performance optimization (image lazy load, code splitting)
- [ ] Final responsive + accessibility audit

### Phase 6 — Deployment
- [ ] Deploy Python API to Railway or Render
- [ ] Deploy Next.js to Vercel
- [ ] Configure production env vars
- [ ] End-to-end smoke test

---

## Out of Scope (v1)

- User authentication / accounts
- Payment processing / booking engine
- Real-time live hotel price APIs (we use curated static data, not live booking feeds)
- Admin CMS for managing packages
- Multi-language support

---

## Future Enhancements (v2+)

- Integrate flight search API (Amadeus / Skyscanner)
- User accounts with saved itineraries
- Social sharing of generated tour plans
- Voice input for chat
- Admin dashboard to manage destinations and packages
- PDF export of generated itinerary
