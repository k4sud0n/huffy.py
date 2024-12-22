from fastapi import APIRouter
import aiohttp
from datetime import datetime
from pyquery import PyQuery as pq
from models import Menu

router = APIRouter()


@router.get("/menu/{name}")
async def read_menu(name: str):
    today_date = datetime.now().strftime("%Y%m%d")
    url = f"https://wis.hufs.ac.kr/jsp/HUFS/cafeteria/viewWeek.jsp?startDt={today_date}&endDt={today_date}&caf_id=h203"

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            data = await response.text()

    doc = pq(data)
    rows = doc("table tr[height='35'] td.listStyle")

    menu_items = []

    for index, row in enumerate(rows.items()):
        menu_items.append(row.text())

    menu_data = {
        "date": today_date,
        "menu1": menu_items[0] if len(menu_items) > 0 else "등록된 메뉴가 없습니다.",
        "menu2": menu_items[1] if len(menu_items) > 1 else None,
        "menu3": menu_items[2] if len(menu_items) > 2 else None,
        "menu4": menu_items[3] if len(menu_items) > 3 else None,
        "menu5": menu_items[4] if len(menu_items) > 4 else None,
    }

    menu = await Menu.create(**menu_data)

    return {"data": doc("table tr[height='35']").text()}
