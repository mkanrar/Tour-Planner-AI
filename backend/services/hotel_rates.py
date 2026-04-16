"""
Amadeus Hotel Rates Service
-----------------------------
Uses the Amadeus Travel API (free sandbox + production tier) to fetch
live hotel availability and rates for a given destination.

Free tier: https://developers.amadeus.com
  - 2,000 API calls/month on the test environment
  - Switch AMADEUS_BASE to production URL when ready

Required env vars:
  AMADEUS_CLIENT_ID
  AMADEUS_CLIENT_SECRET
"""

import os
import time
import httpx

# ── Config ────────────────────────────────────────────────────────────────────

AMADEUS_CLIENT_ID = os.getenv("AMADEUS_CLIENT_ID", "")
AMADEUS_CLIENT_SECRET = os.getenv("AMADEUS_CLIENT_SECRET", "")

# Use test environment by default; swap to production when credentials upgraded
AMADEUS_BASE = os.getenv("AMADEUS_BASE_URL", "https://test.api.amadeus.com")

# ── Token cache (in-memory, per worker) ──────────────────────────────────────

_token_cache: dict = {"token": None, "expires_at": 0.0}


async def _get_access_token() -> str:
    """Fetch or return cached Amadeus OAuth2 bearer token."""
    now = time.time()
    if _token_cache["token"] and _token_cache["expires_at"] > now + 60:
        return _token_cache["token"]

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            f"{AMADEUS_BASE}/v1/security/oauth2/token",
            data={
                "grant_type": "client_credentials",
                "client_id": AMADEUS_CLIENT_ID,
                "client_secret": AMADEUS_CLIENT_SECRET,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        resp.raise_for_status()
        data = resp.json()

    _token_cache["token"] = data["access_token"]
    _token_cache["expires_at"] = now + int(data.get("expires_in", 1799))
    return _token_cache["token"]


# ── IATA city code mapping ────────────────────────────────────────────────────

CITY_CODES: dict[str, str] = {
    # Bangladesh
    "cox's bazar": "CXB",
    "coxs bazar":  "CXB",
    "dhaka":       "DAC",
    "chittagong":  "CGP",
    "sylhet":      "ZYL",
    # South / South-East Asia
    "bangkok":     "BKK",
    "thailand":    "BKK",
    "phuket":      "HKT",
    "bali":        "DPS",
    "indonesia":   "DPS",
    "singapore":   "SIN",
    "kathmandu":   "KTM",
    "nepal":       "KTM",
    "maldives":    "MLE",
    "colombo":     "CMB",
    "sri lanka":   "CMB",
    # Middle East
    "dubai":       "DXB",
    "abu dhabi":   "AUH",
    # Europe
    "paris":       "PAR",
    "london":      "LON",
    "rome":        "ROM",
    "barcelona":   "BCN",
    "amsterdam":   "AMS",
    # Americas
    "new york":    "NYC",
    "los angeles": "LAX",
    "miami":       "MIA",
}


def _resolve_city_code(destination: str) -> str | None:
    """Return the IATA city code for a destination string, or None."""
    key = destination.strip().lower()
    # Exact match
    if key in CITY_CODES:
        return CITY_CODES[key]
    # Partial match
    for name, code in CITY_CODES.items():
        if name in key or key in name:
            return code
    return None


# ── Main fetch function ───────────────────────────────────────────────────────

async def fetch_live_hotel_rates(
    destination: str,
    check_in: str,          # YYYY-MM-DD
    check_out: str,         # YYYY-MM-DD
    adults: int = 1,
    currency: str = "INR",
    max_results: int = 6,
) -> dict:
    """
    Return live hotel rates from Amadeus for the given destination & dates.

    Returns a dict with keys:
      - destination (str)
      - city_code (str)
      - check_in / check_out (str)
      - hotels (list of hotel dicts)
      - error (str | None)  — set when the API call fails
    """
    if not AMADEUS_CLIENT_ID or not AMADEUS_CLIENT_SECRET:
        return {
            "error": (
                "Amadeus API credentials are not configured. "
                "Please set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET in the .env file."
            ),
            "hotels": [],
        }

    city_code = _resolve_city_code(destination)
    if not city_code:
        return {
            "error": f"No IATA city code found for destination '{destination}'.",
            "hotels": [],
        }

    try:
        token = await _get_access_token()
        headers = {"Authorization": f"Bearer {token}"}

        async with httpx.AsyncClient(timeout=15) as client:

            # ── Step 1: Get hotel IDs for the city ───────────────────────────
            hotel_resp = await client.get(
                f"{AMADEUS_BASE}/v1/reference-data/locations/hotels/by-city",
                params={
                    "cityCode": city_code,
                    "radius": 5,
                    "radiusUnit": "KM",
                    "ratings": "3,4,5",
                },
                headers=headers,
            )
            hotel_resp.raise_for_status()
            hotel_list = hotel_resp.json().get("data", [])[:20]
            hotel_ids = [h["hotelId"] for h in hotel_list]

            if not hotel_ids:
                return {
                    "destination": destination,
                    "city_code": city_code,
                    "error": "No hotels found in the Amadeus database for this city.",
                    "hotels": [],
                }

            # ── Step 2: Get live offers (rates) ──────────────────────────────
            offers_resp = await client.get(
                f"{AMADEUS_BASE}/v3/shopping/hotel-offers",
                params={
                    "hotelIds": ",".join(hotel_ids),
                    "checkInDate": check_in,
                    "checkOutDate": check_out,
                    "adults": adults,
                    "currency": currency,
                    "bestRateOnly": "true",
                },
                headers=headers,
            )
            offers_resp.raise_for_status()
            offers = offers_resp.json().get("data", [])

    except httpx.HTTPStatusError as exc:
        return {
            "destination": destination,
            "city_code": city_code,
            "error": f"Amadeus API error {exc.response.status_code}: {exc.response.text[:300]}",
            "hotels": [],
        }
    except Exception as exc:
        return {
            "destination": destination,
            "city_code": city_code,
            "error": f"Failed to fetch hotel rates: {str(exc)}",
            "hotels": [],
        }

    # ── Format results ────────────────────────────────────────────────────────
    hotels = []
    for offer_data in offers[:max_results]:
        hotel = offer_data.get("hotel", {})
        best_offer = (offer_data.get("offers") or [{}])[0]
        price = best_offer.get("price", {})
        room = best_offer.get("room", {})
        policies = best_offer.get("policies", {})

        hotels.append({
            "name": hotel.get("name", "Unknown Hotel"),
            "hotel_id": hotel.get("hotelId", ""),
            "stars": hotel.get("rating", "N/A"),
            "latitude": hotel.get("latitude"),
            "longitude": hotel.get("longitude"),
            "currency": price.get("currency", currency),
            "price_per_night": price.get("base", price.get("total", "N/A")),
            "total_price": price.get("total", "N/A"),
            "taxes_and_fees": price.get("taxes", []),
            "room_type": room.get("type", "Standard Room"),
            "room_description": room.get("description", {}).get("text", ""),
            "board_type": best_offer.get("boardType", "ROOM_ONLY"),
            "cancellation_policy": (
                policies.get("cancellations", [{}])[0].get("description", {}).get("text", "N/A")
                if policies.get("cancellations") else "N/A"
            ),
            "check_in": check_in,
            "check_out": check_out,
            "adults": adults,
            "source": "Amadeus Live API",
        })

    return {
        "destination": destination,
        "city_code": city_code,
        "check_in": check_in,
        "check_out": check_out,
        "adults": adults,
        "currency": currency,
        "hotels": hotels,
        "total_found": len(offers),
        "error": None,
    }
