from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from datetime import datetime

from stock_analysis.database import get_session
from stock_analysis.services import (
    fetch_large_cap_stocks,
    calculate_roi,
    analyze_investment_opportunities,
    update_stock_data
)

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/api/stocks/large-cap")
async def get_large_cap_stocks() -> List[Dict[str, Any]]:
    """Get list of US stocks with market cap > $500B"""
    return await fetch_large_cap_stocks()

@app.get("/api/stocks/{symbol}/roi")
async def get_stock_roi(symbol: str) -> Dict[str, Any]:
    """Get 1-year ROI data for specific stock"""
    return await calculate_roi(symbol)

@app.get("/api/analysis/top-investments")
async def get_top_investments(session: AsyncSession = Depends(get_session)) -> List[Dict[str, Any]]:
    """Get top 5 investment opportunities"""
    return await analyze_investment_opportunities(session)

@app.post("/api/data/update")
async def trigger_data_update(session: AsyncSession = Depends(get_session)):
    """Trigger daily data update"""
    try:
        await update_stock_data(session)
        return {"status": "success", "timestamp": datetime.utcnow()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
