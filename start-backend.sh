#!/bin/bash
# Start the backend service for smart-shop

cd ~/smart-shop/backend

# Activate virtual environment
source .venv/bin/activate

# Start the backend
echo "Starting backend on http://100.81.70.37:8000"
python main.py
