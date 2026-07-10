#!/bin/bash
echo "--- Entering Backend Directory ---"
cd backend

echo "--- Installing Dependencies From Nested Folder ---"
/tmp/antenv/bin/pip install -r requirements.txt

echo "--- Starting Uvicorn Server ---"
/tmp/antenv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8000