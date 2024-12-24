from datetime import datetime, timedelta

from fastapi import APIRouter
from models import Menu

router = APIRouter()

menu_cache = {}
cache_expiry_time = None


@router.get("/menu/{location}")
@router.post("/menu/{location}")
async def read_menu(location: str):
    global cache_expiry_time

    now = datetime.now()
    today = now.date()

    if not cache_expiry_time or now >= cache_expiry_time:
        menu_cache.clear()
        cache_expiry_time = datetime.combine(
            today + timedelta(days=1), datetime.min.time()
        )

    cache_key = f"{location}_{today}"
    if cache_key in menu_cache:
        return menu_cache[cache_key]

    # 캐시가 없으면 DB에서 읽기
    menu = await Menu.filter(location=location, date=today).first()
    if not menu:
        return {"error": "Menu not found"}

    items = [
        {"description": getattr(menu, f"menu{i}", None)}
        for i in range(1, 6)
        if getattr(menu, f"menu{i}", None)
    ]

    response = {
        "version": "2.0",
        "template": {"outputs": [{"carousel": {"type": "textCard", "items": items}}]},
    }

    menu_cache[cache_key] = response
    return response
