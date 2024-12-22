from datetime import datetime

import aiohttp
from fastapi import FastAPI, APIRouter
from pyquery import PyQuery

app = FastAPI()
router = APIRouter(prefix="/api/v1", tags=["v1"])


@router.get("/notice")
async def read_notice(limit: int = 5):
    return {"message": limit}


@router.get("/menu/{name}")
async def read_menu(name: str):
    # today_date = datetime.now().strftime("%Y%m%d")
    #  url = f"https://wis.hufs.ac.kr/jsp/HUFS/cafeteria/viewWeek.jsp?startDt={today_date}&endDt={today_date}&caf_id=h101"
    url = "https://wis.hufs.ac.kr/jsp/HUFS/cafeteria/viewWeek.jsp?startDt=20241219&endDt=20241219&caf_id=h205"

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            data = await response.text()

    doc = PyQuery(data)

    return {"data": doc("table").text()}


app.include_router(router)
