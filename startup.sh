#!/bin/bash
echo "--- Entering Backend Directory ---"
cd backend

echo "--- Installing Dependencies From Nested Folder ---"
pip install -r requirements.txt

echo "--- Starting Uvicorn Server ---"
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000