import asyncio
import json
import os
from datetime import date, timedelta
from pathlib import Path
from openai import AsyncOpenAI
from services.hotel_rates import fetch_live_hotel_rates

# ── Load knowledge base ───────────────────────────────────────────────────────
DATA_DIR = Path(__file__).parent.parent / "data"

with open(DATA_DIR / "destinations.json", encoding="utf-8") as f:
    DESTINATIONS: list[dict] = json.load(f)

with open(DATA_DIR / "packages.json", encoding="utf-8") as f:
    PACKAGES: list[dict] = json.load(f)

with open(DATA_DIR / "accommodations.json", encoding="utf-8") as f:
    ACCOMMODATIONS: list[dict] = json.load(f)

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ── System prompt ─────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are an expert AI travel consultant for TourPlanner, specializing in:
- Domestic Bangladesh destinations (Cox's Bazar, Sajek, Bandarban, Sylhet, Sundarbans, etc.)
- International destinations (Maldives, Thailand, Bali, Dubai, Nepal, Singapore, Paris, etc.)
- Budget planning across budget / standard / luxury tiers
- Hotels, homestays, guesthouses, resorts, and hostels
- Seasonal travel recommendations and current hotel rates
- Day-by-day itinerary building
- Visa and logistics guidance (general, non-legal)

**CURRENCY: All prices must be in Indian Rupees (₹ INR). Never quote USD.**
Exchange reference: 1 USD ≈ ₹84 INR (2025 rate).

**Current Hotel Rate Knowledge (2024–2025):**
- Cox's Bazar budget hotels: ₹1,200–₹2,500/night (off-season), ₹1,800–₹3,500 (peak Nov–Feb)
- Cox's Bazar standard hotels: ₹3,400–₹6,300/night, sea-view premium ₹1,500 extra
- Cox's Bazar luxury resorts: ₹10,000–₹18,500/night, peak ₹14,000–₹26,000
- Sajek homestays: ₹650–₹1,250/night incl. meals (peak Oct–Jan books out 2 weeks ahead)
- Sajek Resort: ₹2,900–₹5,000/night (peak ₹4,200–₹7,500)
- Bandarban homestays: ₹500–₹1,000/night incl. meals
- Nilgiri Hotel, Bandarban: ₹3,800–₹6,700/night (army-managed; book via official site)
- Sylhet guesthouses: ₹850–₹1,850/night, spring premium +30%
- Sylhet Rose View Hotel: ₹2,900–₹5,500/night
- Sundarbans houseboat (per person, incl. meals+guide+permit): ₹5,000–₹8,400/night
- Bangkok budget hostels: ₹1,000–₹2,100/night (dorm ₹1,000, private ₹2,100)
- Phuket standard hotels: ₹4,600–₹8,000/night (high season Dec–Jan +40%)
- Bali budget guesthouses: ₹1,500–₹2,900/night incl. breakfast
- Bali luxury villas: ₹21,000–₹42,000/night (peak Dec–Jan ₹55,000+)
- Dubai budget hotels: ₹4,600–₹7,600/night (DSF & NYE spike to ₹12,000+)
- Kathmandu budget hotels: ₹1,000–₹2,100/night (trekking season Oct–Nov doubles rates)

**Seasonal rate tips to share with users:**
- Book 2 weeks ahead for Cox's Bazar in winter (Nov–Feb)
- Sajek Valley: off-season (Apr–Sep) has 35% discounts
- Bali: avoid July–August (peak season, rates 3x)
- Dubai: cheapest in summer (Apr–Jun) but extremely hot
- Nepal trekking season: Oct–Nov and Mar–May; book 4 weeks ahead

---

## ✍️ Response Formatting Rules

Write in clean, flowing prose — no bullet points, no dashes, no numbered lists, no blank lines between sentences.

### Style
- Be warm, friendly, and enthusiastic about travel
- Use **bold** for key highlights such as prices, hotel names, and place names
- Write everything as natural sentences and paragraphs, not lists
- Keep each paragraph to 2–3 sentences; move to the next topic with a new paragraph (single line break only)

### Prices
- Always in **₹ INR** with comma formatting (e.g. ₹4,200/night)
- Include current rate and peak rate inline: e.g. "rooms cost ₹3,400–₹6,300/night (peak: ₹9,000)"

### Itineraries
Use short bold day headings followed by a single flowing paragraph per day:

**Day 1 — Arrival & Beach** Write what to do in the morning, afternoon, and evening as one connected paragraph. Mention the hotel and cost inline.

**Day 2 — Exploration** Continue in the same paragraph style.

For budget, write it as a short paragraph: "Expect to spend around ₹X on accommodation, ₹Y on food, and ₹Z on transport, bringing your total to roughly ₹XX,XXX per person."

### Accommodations
Describe each option as a sentence: "**Hotel Name** (Budget/Standard/Luxury) is located in [area], priced at ₹X–₹Y/night (peak ₹Z), rated [R]/5, and is best known for [highlight]. Book [tip]."

### Ending Every Response
Always close with a short follow-up question or helpful suggestion as a natural sentence.
"""

# ── OpenAI tool definitions ───────────────────────────────────────────────────
TOUR_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_destinations",
            "description": "Search and filter tour destinations by keyword, season, or type (domestic/international).",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Destination name or keyword"},
                    "season": {
                        "type": "string",
                        "enum": ["Spring", "Summer", "Autumn", "Winter"],
                        "description": "Season filter",
                    },
                    "type": {
                        "type": "string",
                        "enum": ["domestic", "international"],
                        "description": "Domestic or international",
                    },
                },
                "required": [],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "generate_itinerary",
            "description": "Generate a detailed day-by-day itinerary for a destination.",
            "parameters": {
                "type": "object",
                "properties": {
                    "destination": {"type": "string", "description": "Destination name"},
                    "days": {"type": "integer", "description": "Number of days"},
                    "budget_usd": {"type": "number", "description": "Total budget in USD"},
                    "travelers": {"type": "integer", "description": "Number of travelers"},
                    "preferences": {
                        "type": "string",
                        "description": "User preferences e.g. adventure, family, honeymoon, cultural",
                    },
                },
                "required": ["destination", "days"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_package_info",
            "description": "Get available tour package details for a destination.",
            "parameters": {
                "type": "object",
                "properties": {
                    "destination": {"type": "string"},
                    "season": {"type": "string", "enum": ["Spring", "Summer", "Autumn", "Winter"]},
                },
                "required": ["destination"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_season_recommendations",
            "description": "Get top destination recommendations for a specific travel season.",
            "parameters": {
                "type": "object",
                "properties": {
                    "season": {
                        "type": "string",
                        "enum": ["Spring", "Summer", "Autumn", "Winter"],
                    },
                    "budget_range": {
                        "type": "string",
                        "enum": ["budget", "standard", "luxury"],
                        "description": "Price tier preference",
                    },
                    "type": {
                        "type": "string",
                        "enum": ["domestic", "international", "any"],
                        "description": "Domestic, international, or any",
                    },
                },
                "required": ["season"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "suggest_accommodations",
            "description": "Suggest hotels, homestays, guesthouses, resorts, or hostels for a destination. Use this whenever the user asks for where to stay, budget hotels, homestays, or accommodation options.",
            "parameters": {
                "type": "object",
                "properties": {
                    "destination": {
                        "type": "string",
                        "description": "Destination name or ID",
                    },
                    "type": {
                        "type": "string",
                        "enum": ["hotel", "homestay", "guesthouse", "resort", "hostel", "any"],
                        "description": "Type of accommodation. Default: any",
                    },
                    "tier": {
                        "type": "string",
                        "enum": ["budget", "standard", "luxury", "any"],
                        "description": "Price tier. Default: any",
                    },
                    "max_price_per_night": {
                        "type": "number",
                        "description": "Maximum price per night in USD",
                    },
                    "travelers": {
                        "type": "integer",
                        "description": "Number of travelers",
                    },
                },
                "required": ["destination"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_live_hotel_rates",
            "description": (
                "Fetch real-time hotel availability and rates from the Amadeus global travel API. "
                "Use this when the user asks for current prices, live rates, today's rates, "
                "or 'how much does it cost right now' for any destination. "
                "Always prefer this over the static knowledge in your training data for price accuracy."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "destination": {
                        "type": "string",
                        "description": "Destination city or country name (e.g. 'Bangkok', 'Bali', \"Cox's Bazar\")",
                    },
                    "check_in": {
                        "type": "string",
                        "description": "Check-in date in YYYY-MM-DD format. Default: tomorrow.",
                    },
                    "check_out": {
                        "type": "string",
                        "description": "Check-out date in YYYY-MM-DD format. Default: 2 days from today.",
                    },
                    "adults": {
                        "type": "integer",
                        "description": "Number of adult guests. Default: 1.",
                    },
                    "currency": {
                        "type": "string",
                        "description": "Currency code for prices. Default: INR.",
                    },
                },
                "required": ["destination"],
            },
        },
    },
]

# ── Tool implementations ──────────────────────────────────────────────────────

def _match(text: str, query: str) -> bool:
    return query.lower() in text.lower()


def search_destinations(
    query: str = "",
    season: str | None = None,
    type: str | None = None,
) -> list[dict]:
    results = DESTINATIONS
    if query:
        results = [
            d for d in results
            if _match(d["name"], query)
            or _match(d["country"], query)
            or any(_match(c, query) for c in d["category"])
            or _match(d["description"], query)
        ]
    if season:
        results = [d for d in results if season in d["seasons"]]
    if type:
        results = [d for d in results if d["type"] == type]
    return results[:6]


def generate_itinerary(
    destination: str,
    days: int,
    budget_usd: float | None = None,
    travelers: int = 1,
    preferences: str | None = None,
) -> dict:
    dest = next(
        (d for d in DESTINATIONS if _match(d["name"], destination)),
        None,
    )
    packages = [p for p in PACKAGES if _match(p["destination_id"], destination.lower().replace(" ", "-"))]
    return {
        "destination": destination,
        "days": days,
        "budget_usd": budget_usd,
        "travelers": travelers,
        "preferences": preferences,
        "destination_info": dest,
        "available_packages": packages[:2],
        "note": "Generate a detailed day-by-day itinerary based on this destination data.",
    }


def get_package_info(destination: str, season: str | None = None) -> list[dict]:
    dest_id = destination.lower().replace(" ", "-").replace("'", "")
    results = [
        p for p in PACKAGES
        if _match(p["destination_id"], dest_id) or _match(p["title"], destination)
    ]
    if season:
        results = [p for p in results if p["season"] == season]
    return results


def get_season_recommendations(
    season: str,
    budget_range: str = "any",
    type: str = "any",
) -> list[dict]:
    dests = DESTINATIONS
    if type != "any":
        dests = [d for d in dests if d["type"] == type]
    dests = [d for d in dests if season in d["seasons"]]

    if budget_range == "budget":
        dests = sorted(dests, key=lambda d: d["price_from"])[:4]
    elif budget_range == "luxury":
        dests = sorted(dests, key=lambda d: d["price_from"], reverse=True)[:4]
    else:
        dests = dests[:6]

    return dests


def suggest_accommodations(
    destination: str,
    type: str = "any",
    tier: str = "any",
    max_price_per_night: float | None = None,
    travelers: int = 1,
) -> list[dict]:
    results = [
        a for a in ACCOMMODATIONS
        if _match(a["destination_id"], destination.lower().replace(" ", "-").replace("'", ""))
        or _match(a["location"], destination)
    ]
    if type != "any":
        results = [a for a in results if a["type"] == type]
    if tier != "any":
        results = [a for a in results if a["tier"] == tier]
    if max_price_per_night is not None:
        results = [a for a in results if a["price_per_night"]["min"] <= max_price_per_night]
    return sorted(results, key=lambda a: a["rating"], reverse=True)[:5]


async def get_live_hotel_rates(
    destination: str,
    check_in: str | None = None,
    check_out: str | None = None,
    adults: int = 1,
    currency: str = "INR",
) -> dict:
    """Async wrapper — called by the agent runner for live Amadeus rates."""
    today = date.today()
    if not check_in:
        check_in = (today + timedelta(days=1)).isoformat()
    if not check_out:
        check_out = (today + timedelta(days=2)).isoformat()
    return await fetch_live_hotel_rates(
        destination=destination,
        check_in=check_in,
        check_out=check_out,
        adults=adults,
        currency=currency,
    )


TOOL_MAP = {
    "search_destinations": search_destinations,
    "generate_itinerary": generate_itinerary,
    "get_package_info": get_package_info,
    "get_season_recommendations": get_season_recommendations,
    "suggest_accommodations": suggest_accommodations,
    "get_live_hotel_rates": get_live_hotel_rates,
}

# ── Agent runner ──────────────────────────────────────────────────────────────

async def run_agent_stream(
    message: str,
    history: list[dict],
):
    """
    Async generator that yields text chunks for SSE.

    Strategy:
    1. Non-streaming call to resolve any tool calls (function calling loop).
    2. Once all tools are resolved, stream the final answer to the client.
    """
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += history[-20:]  # Keep last 10 exchanges
    messages.append({"role": "user", "content": message})

    # ── Step 1: Resolve tool calls (non-streaming) ───────────────────────────
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=TOUR_TOOLS,
        tool_choice="auto",
    )
    assistant_msg = response.choices[0].message

    while assistant_msg.tool_calls:
        messages.append(assistant_msg)

        for tool_call in assistant_msg.tool_calls:
            fn_name = tool_call.function.name
            fn_args = json.loads(tool_call.function.arguments)
            fn = TOOL_MAP.get(fn_name)
            if fn is None:
                result = {"error": f"Unknown tool: {fn_name}"}
            else:
                raw = fn(**fn_args)
                result = await raw if asyncio.iscoroutine(raw) else raw

            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result, ensure_ascii=False),
                }
            )

        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            tools=TOUR_TOOLS,
            tool_choice="auto",
        )
        assistant_msg = response.choices[0].message

    # ── Step 2: Stream final answer ──────────────────────────────────────────
    # messages already contains tool results; ask model to stream its reply
    stream = await client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        stream=True,
    )

    async for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
