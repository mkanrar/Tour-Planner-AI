# Tour Planner — Skills & Technology Reference

## Overview

This document maps each part of the TourPlanner application to the specific technology skills required, with key concepts, libraries, and patterns to apply during development.

---

## 1. Next.js Frontend Skills

### Core Framework
- **Next.js 14+ App Router** — use `app/` directory structure, `page.tsx` for the single page, `layout.tsx` for root layout
- **React Server Components (RSC)** — static sections (Hero, DestinationGrid) can be RSCs; interactive sections (ChatWidget) must be `"use client"`
- **TypeScript** — strict mode enabled; define all props and API response shapes in `lib/types.ts`

### Styling
- **Tailwind CSS v3** — utility-first; define brand colors in `tailwind.config.ts` under `extend.colors`
- **shadcn/ui** — use `Button`, `Card`, `Tabs`, `Badge`, `Skeleton` components; install via `npx shadcn-ui@latest add <component>`
- **CSS Variables** — Tailwind custom properties for dark/light theming if added later
- **Framer Motion** — `motion.div` with `initial`, `animate`, `whileInView` for scroll animations; `AnimatePresence` for chat panel mount/unmount

### Data Fetching
- **fetch API** — use Next.js extended `fetch` with `cache: 'no-store'` for dynamic tour data from Python backend
- **SWR or React Query** — optional, for client-side tour data fetching with caching
- **Environment variables** — `NEXT_PUBLIC_API_URL` for backend base URL; never expose `OPENAI_API_KEY` to frontend

### Chat Widget Patterns
- **useState + useRef** — manage message list, input value, scroll-to-bottom ref
- **ReadableStream / EventSource** — consume streaming responses from FastAPI using `fetch` with `response.body.getReader()`
- **localStorage** — persist `messages[]` array keyed by `session_id` (UUID generated client-side)
- **Optimistic UI** — append user message immediately before API response arrives

### Images
- **next/image** — use `<Image>` component for all tour photos; set `sizes` prop for responsive loading
- **Unsplash Source URLs** — for development placeholders (e.g., `https://source.unsplash.com/featured/?beach,travel`)
- **Public folder** — `/public/images/` for any static bundled assets

---

## 2. Python FastAPI Backend Skills

### Framework Setup
- **FastAPI** — `pip install fastapi uvicorn`; entry point `main.py` with `app = FastAPI()`
- **Uvicorn** — ASGI server: `uvicorn main:app --reload --port 8000`
- **CORS Middleware** — `from fastapi.middleware.cors import CORSMiddleware`; allow `NEXT_PUBLIC_API_URL` origin

### Request / Response Modeling
- **Pydantic v2** — define all request bodies and response models in `models/schemas.py`
  ```python
  class ChatRequest(BaseModel):
      message: str
      history: list[ChatMessage] = []
      session_id: str
  ```
- **Type hints** — full type annotations on all function signatures
- **HTTPException** — use for error responses with appropriate status codes

### Routing
- **APIRouter** — split routes into `routers/chat.py` and `routers/tours.py`; include in `main.py`
- **Path & Query params** — use typed parameters (e.g., `season: Literal["Spring","Summer","Autumn","Winter"] | None = None`)

### Streaming Responses
- **StreamingResponse** — `from fastapi.responses import StreamingResponse`
- **async generator** — yield chunks from OpenAI stream as SSE (Server-Sent Events) or plain text chunks
  ```python
  async def stream_generator():
      async for chunk in openai_stream:
          yield f"data: {chunk}\n\n"
  return StreamingResponse(stream_generator(), media_type="text/event-stream")
  ```

### Configuration
- **python-dotenv** — `from dotenv import load_dotenv`; load `.env` for `OPENAI_API_KEY`
- **pydantic-settings** — alternative: `BaseSettings` class for typed config with env var mapping

---

## 3. OpenAI Integration Skills

### Client Setup
- **openai Python SDK** — `pip install openai`; `from openai import AsyncOpenAI`
- **Async client** — use `AsyncOpenAI` for non-blocking FastAPI compatibility

### Chat Completions
```python
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

response = await client.chat.completions.create(
    model="gpt-4o",
    messages=[system_msg, *history, user_msg],
    tools=TOUR_TOOLS,
    tool_choice="auto",
    stream=True
)
```

### Function Calling (Tools)
- Define tools as JSON schema objects in `agents/tour_agent.py`:
  ```python
  TOUR_TOOLS = [
      {
          "type": "function",
          "function": {
              "name": "search_destinations",
              "description": "Search tour destinations by query, season, or type",
              "parameters": {
                  "type": "object",
                  "properties": {
                      "query": {"type": "string"},
                      "season": {"type": "string", "enum": ["Spring","Summer","Autumn","Winter"]},
                      "type": {"type": "string", "enum": ["domestic","international"]}
                  },
                  "required": ["query"]
              }
          }
      },
      {
          "type": "function",
          "function": {
              "name": "generate_itinerary",
              "description": "Generate a day-by-day tour itinerary",
              "parameters": {
                  "type": "object",
                  "properties": {
                      "destination": {"type": "string"},
                      "days": {"type": "integer"},
                      "budget_usd": {"type": "number"},
                      "travelers": {"type": "integer"},
                      "preferences": {"type": "string"}
                  },
                  "required": ["destination", "days"]
              }
          }
      },
      {
          "type": "function",
          "function": {
              "name": "suggest_accommodations",
              "description": "Suggest budget hotels, homestays, or guesthouses for a destination",
              "parameters": {
                  "type": "object",
                  "properties": {
                      "destination": {"type": "string"},
                      "type": {
                          "type": "string",
                          "enum": ["hotel", "homestay", "guesthouse", "resort", "hostel", "any"],
                          "description": "Type of accommodation requested"
                      },
                      "tier": {
                          "type": "string",
                          "enum": ["budget", "standard", "luxury", "any"],
                          "description": "Price tier preference"
                      },
                      "max_price_per_night": {
                          "type": "number",
                          "description": "Maximum price per night in USD"
                      },
                      "travelers": {
                          "type": "integer",
                          "description": "Number of travelers (affects room type suggestions)"
                      }
                  },
                  "required": ["destination"]
              }
          }
      }
  ]
  ```
- **Tool call loop** — check `response.choices[0].message.tool_calls`; execute matched Python function; append `tool` role message; re-call completions API

### System Prompt Engineering
- Role: "Expert travel consultant specializing in domestic Bangladesh tours and international travel"
- Include: current date, available destinations list, response format instructions (use markdown for itineraries)
- Tone: friendly, concise, organized with bullet points and day-by-day formatting

### Conversation History
- Store last **10 message pairs** (20 messages) to stay within context limits
- Trim oldest messages when limit exceeded
- Include `session_id` in server-side cache (Python dict or Redis) for multi-turn context

---

## 4. Data Layer Skills

### Static JSON Knowledge Base
- `data/destinations.json` — array of destination objects (see PLAN.md Data Model)
- `data/accommodations.json` — array of hotel/homestay objects keyed by `destination_id`; loaded at startup alongside destinations
- `data/packages.json` — array of package objects keyed by season
- Load once at startup: `with open("data/destinations.json") as f: DESTINATIONS = json.load(f)`

### Search Logic
- Simple keyword + filter matching in `agents/tour_agent.py` tool implementations
- For fuzzy search: `pip install rapidfuzz` — `process.extractBests(query, names, scorer=fuzz.partial_ratio)`

### `suggest_accommodations` Tool Implementation
```python
def suggest_accommodations(destination, type="any", tier="any", max_price_per_night=None, travelers=1):
    results = [
        a for a in ACCOMMODATIONS
        if destination.lower() in a["destination_id"]
        and (type == "any" or a["type"] == type)
        and (tier == "any" or a["tier"] == tier)
        and (max_price_per_night is None or a["price_per_night"]["min"] <= max_price_per_night)
    ]
    # Sort by rating descending, return top 5
    return sorted(results, key=lambda x: x["rating"], reverse=True)[:5]
```
- Returns structured list; agent formats as a readable markdown table or bullet list in the chat response
- When `type` is not specified by the user, default to `"any"` and let the agent present a mix of hotels and homestays

---

## 5. Project Setup Commands

### Frontend Bootstrap
```bash
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir no --import-alias "@/*"
cd frontend
npx shadcn-ui@latest init
npm install framer-motion
npm install @types/node
```

### Backend Bootstrap
```bash
mkdir backend && cd backend
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install fastapi uvicorn python-dotenv openai pydantic rapidfuzz
pip freeze > requirements.txt
```

### Running Locally
```bash
# Terminal 1 — Backend
cd backend && uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend && npm run dev
```

---

## 6. Key Integration Points

| Frontend Component  | Backend Endpoint                           | Notes                                                      |
|---------------------|--------------------------------------------|------------------------------------------------------------|
| ChatWidget          | POST /api/chat                             | Streaming SSE; maintain session history                    |
| AccommodationCard   | Rendered inside ChatWidget                 | Agent returns accommodation JSON; frontend renders cards   |
| DestinationGrid     | GET /api/destinations                      | Filter by type (domestic/international)                    |
| SeasonTabs          | GET /api/tours?season=Winter               | Filter packages by season                                  |
| Hero search bar     | Opens ChatWidget                           | Pre-fills message with destination query                   |
| Chat quick prompts  | POST /api/chat (pre-filled)                | "Suggest budget hotels in X" chips trigger accommodation tool |

---

## 7. Testing Checklist

- [ ] FastAPI `/health` returns 200
- [ ] `POST /api/chat` returns streamed response for a basic message
- [ ] Function calling triggers correct tool and returns structured itinerary
- [ ] `suggest_accommodations` tool returns filtered hotels/homestays by tier and budget
- [ ] Chat correctly renders inline AccommodationCard components for hotel/homestay replies
- [ ] `GET /api/accommodations/{destination}` returns filtered results
- [ ] `GET /api/destinations` returns filtered results
- [ ] Chat widget opens/closes correctly on mobile and desktop
- [ ] Messages persist after page refresh (localStorage)
- [ ] Image lazy loading works (check Network tab)
- [ ] CORS headers present on all API responses

---

## 8. Common Pitfalls to Avoid

| Pitfall                                | Fix                                                        |
|----------------------------------------|------------------------------------------------------------|
| Exposing OPENAI_API_KEY to frontend    | Always call OpenAI from Python backend only                |
| Blocking event loop in FastAPI         | Use `AsyncOpenAI` client; never use `time.sleep()`         |
| Chat history growing unbounded         | Trim to last 10 exchanges before each API call             |
| CORS errors in development             | Add `http://localhost:3000` to `CORS_ORIGINS` in `.env`    |
| `next/image` layout shift              | Always provide `width`, `height` or `fill` + `sizes` props |
| Stream not flushing in browser         | Set `Transfer-Encoding: chunked` or use SSE format         |
