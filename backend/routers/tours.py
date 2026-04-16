import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

DATA_DIR = Path(__file__).parent.parent / "data"

with open(DATA_DIR / "destinations.json", encoding="utf-8") as f:
    DESTINATIONS = json.load(f)

with open(DATA_DIR / "packages.json", encoding="utf-8") as f:
    PACKAGES = json.load(f)


@router.get("/destinations")
def get_destinations(type: str | None = Query(None)):
    if type:
        return [d for d in DESTINATIONS if d["type"] == type]
    return DESTINATIONS


@router.get("/destinations/{dest_id}")
def get_destination(dest_id: str):
    dest = next((d for d in DESTINATIONS if d["id"] == dest_id), None)
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    return dest


@router.get("/tours")
def get_tours(season: str | None = Query(None)):
    if season:
        return [p for p in PACKAGES if p["season"].lower() == season.lower()]
    return PACKAGES


@router.get("/tours/{tour_id}")
def get_tour(tour_id: str):
    pkg = next((p for p in PACKAGES if p["id"] == tour_id), None)
    if not pkg:
        raise HTTPException(status_code=404, detail="Tour package not found")
    return pkg
