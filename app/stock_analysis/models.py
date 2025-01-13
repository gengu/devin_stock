from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Stock(Base):
    __tablename__ = "stocks"
    
    symbol = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    market_cap = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    last_updated = Column(DateTime, default=datetime.utcnow)

class HistoricalPrice(Base):
    __tablename__ = "historical_prices"
    
    id = Column(Integer, primary_key=True)
    symbol = Column(String, ForeignKey("stocks.symbol"), nullable=False)
    date = Column(DateTime, nullable=False)
    price = Column(Float, nullable=False)

class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    
    id = Column(Integer, primary_key=True)
    symbol = Column(String, ForeignKey("stocks.symbol"), nullable=False)
    analysis_date = Column(DateTime, default=datetime.utcnow)
    target_price = Column(Float, nullable=False)
    recommendation = Column(String, nullable=False)
    analysis_factors = Column(String, nullable=False)  # JSON string of factors
