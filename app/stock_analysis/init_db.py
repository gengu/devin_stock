import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from stock_analysis.models import Base
from stock_analysis.database import DATABASE_URL

async def init_db():
    engine = create_async_engine(DATABASE_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_db())
