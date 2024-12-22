from contextlib import asynccontextmanager
from datetime import datetime

import aiohttp
from fastapi import FastAPI, APIRouter
from pyquery import PyQuery as pq

from database import db_init, db_close


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db_init()
    yield
    await db_close()


app = FastAPI(lifespan=lifespan)
router = APIRouter(prefix="/api/v1", tags=["v1"])


@router.get("/notice")
async def read_notice(limit: int = 5):
    return {"message": limit}


@router.get("/menu/{name}")
async def read_menu(name: str):
    # today_date = datetime.now().strftime("%Y%m%d")
    #  url = f"https://wis.hufs.ac.kr/jsp/HUFS/cafeteria/viewWeek.jsp?startDt={today_date}&endDt={today_date}&caf_id=h101"
    url = "https://wis.hufs.ac.kr/jsp/HUFS/cafeteria/viewWeek.jsp?startDt=20241219&endDt=20241219&caf_id=h203"

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            data = await response.text()

    doc = pq(data)
    rows = doc("table tr[height='35'] td.listStyle")

    for index, row in enumerate(rows.items()):
        print(index, row.text())

    return {"data": doc("table tr[height='35']").text()}


app.include_router(router)
