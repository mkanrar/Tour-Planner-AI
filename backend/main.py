from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path

from routers.chat import router as chat_router
from routers.tours import router as tours_router
from routers.accommodations import router as accommodations_router

app = FastAPI(title="TourPlanner API", version="1.0.0")
STATIC_DIR = Path(__file__).parent / "static"

# CORS — allow the Next.js frontend
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(chat_router, prefix="/api")
app.include_router(tours_router, prefix="/api")
app.include_router(accommodations_router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok", "service": "TourPlanner API"}


if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")
