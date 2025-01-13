import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from stock_analysis.models import Stock, HistoricalPrice, AnalysisResult

async def fetch_large_cap_stocks() -> List[Dict[str, Any]]:
    """Fetch US stocks with market cap > $500B"""
    # List of known large-cap US stocks - in production, this should be dynamically updated
    symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "BRK-B", "TSM", "V", "JPM"]
    stocks_data = []
    
    for symbol in symbols:
        try:
            stock = yf.Ticker(symbol)
            info = stock.info
            if info.get('marketCap', 0) > 500_000_000_000:  # 500B
                stocks_data.append({
                    'symbol': symbol,
                    'name': info.get('longName', ''),
                    'market_cap': info.get('marketCap', 0),
                    'current_price': info.get('currentPrice', 0)
                })
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")
    
    return stocks_data

async def calculate_roi(symbol: str) -> Dict[str, Any]:
    """Calculate 1-year ROI for a stock"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    
    stock = yf.Ticker(symbol)
    hist = stock.history(start=start_date, end=end_date)
    
    if len(hist) < 2:
        return {"error": "Insufficient data"}
    
    initial_price = hist.iloc[0]['Close']
    final_price = hist.iloc[-1]['Close']
    roi = ((final_price - initial_price) / initial_price) * 100
    
    return {
        "symbol": symbol,
        "initial_price": initial_price,
        "final_price": final_price,
        "roi_percentage": roi,
        "dates": hist.index.strftime('%Y-%m-%d').tolist(),
        "prices": hist['Close'].tolist()
    }

async def analyze_investment_opportunities(session: AsyncSession) -> List[Dict[str, Any]]:
    """Analyze and return top 5 investment opportunities"""
    stocks = await fetch_large_cap_stocks()
    analysis_results = []
    
    for stock in stocks:
        symbol = stock['symbol']
        roi_data = await calculate_roi(symbol)
        
        # Simple analysis based on ROI and market trends
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        analysis = {
            'symbol': symbol,
            'name': stock['name'],
            'current_price': stock['current_price'],
            'target_price': info.get('targetMeanPrice', stock['current_price'] * 1.1),
            'roi_potential': (info.get('targetMeanPrice', stock['current_price'] * 1.1) - stock['current_price']) / stock['current_price'] * 100,
            'analysis_factors': {
                'pe_ratio': info.get('forwardPE', 0),
                'profit_margins': info.get('profitMargins', 0),
                'analyst_rating': info.get('recommendationKey', 'none'),
                'past_year_roi': roi_data.get('roi_percentage', 0)
            }
        }
        analysis_results.append(analysis)
    
    # Sort by ROI potential and return top 5
    return sorted(analysis_results, key=lambda x: x['roi_potential'], reverse=True)[:5]

async def update_stock_data(session: AsyncSession):
    """Daily update of stock data"""
    stocks = await fetch_large_cap_stocks()
    
    for stock_data in stocks:
        stock = Stock(
            symbol=stock_data['symbol'],
            name=stock_data['name'],
            market_cap=stock_data['market_cap'],
            current_price=stock_data['current_price'],
            last_updated=datetime.utcnow()
        )
        
        # Update or insert stock data
        stmt = select(Stock).where(Stock.symbol == stock_data['symbol'])
        result = await session.execute(stmt)
        existing_stock = result.scalar_one_or_none()
        
        if existing_stock: 
            existing_stock.market_cap = stock_data['market_cap']
            existing_stock.current_price = stock_data['current_price']
            existing_stock.last_updated = datetime.utcnow()
        else:
            session.add(stock)
    
    await session.commit()
