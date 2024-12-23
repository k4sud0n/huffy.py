from datetime import datetime

from fastapi import APIRouter
from models import Menu

router = APIRouter()


@router.get("/menu/{location}")
async def read_menu(location: str):
    menu = await Menu.filter(location=location, date=datetime.today().date()).first()
    if not menu:
        return {"error": "Menu not found"}

    items = [
        {"description": getattr(menu, f"menu{i}", None)}
        for i in range(1, 6)
        if getattr(menu, f"menu{i}", None)
    ]

    return {
        "version": "2.0",
        "template": {"outputs": [{"carousel": {"type": "textCard", "items": items}}]},
    }


@router.post("/menu/{location}")
async def read_menu(location: str):
    menu = await Menu.filter(location=location, date=datetime.today().date()).first()
    if not menu:
        return {"error": "Menu not found"}

    items = [
        {"description": getattr(menu, f"menu{i}", None)}
        for i in range(1, 6)
        if getattr(menu, f"menu{i}", None)
    ]

    return {
        "version": "2.0",
        "template": {"outputs": [{"carousel": {"type": "textCard", "items": items}}]},
    }
