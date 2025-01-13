#!/bin/bash
set -e

# Install dependencies
pip install -r requirements.txt

# Start the application using uvicorn
exec uvicorn stock_analysis.main:app --host 0.0.0.0 --port 8000
