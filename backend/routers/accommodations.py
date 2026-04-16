import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

DATA_DIR = Path(__file__).parent.parent / "data"

with open(DATA_DIR / "accommodations.json", encoding="utf-8") as f:
    ACCOMMODATIONS = json.load(f)


@router.get("/accommodations")
def get_accommodations(
    destination: str | None = Query(None),
    type: str | None = Query(None),
    tier: str | None = Query(None),
):
    results = ACCOMMODATIONS
    if destination:
        results = [
            a for a in results
            if destination.lower() in a["destination_id"]
            or destination.lower() in a["location"].lower()
        ]
    if type:
        results = [a for a in results if a["type"] == type]
    if tier:
        results = [a for a in results if a["tier"] == tier]
    return results


@router.get("/accommodations/{destination_id}")
def get_accommodations_by_destination(
    destination_id: str,
    type: str | None = Query(None),
    tier: str | None = Query(None),
):
    results = [a for a in ACCOMMODATIONS if a["destination_id"] == destination_id]
    if not results:
        raise HTTPException(status_code=404, detail="No accommodations found for this destination")
    if type:
        results = [a for a in results if a["type"] == type]
    if tier:
        results = [a for a in results if a["tier"] == tier]
    return sorted(results, key=lambda a: a["rating"], reverse=True)
