from datetime import datetime, timedelta
import aiohttp
from pyquery import PyQuery as pq

from models import Menu, Notice


async def fetch_hufs_notice(url_id):
    yesterday = (datetime.now() - timedelta(days=1)).date()
    url = f"https://www.hufs.ac.kr/hufs/{url_id}/subview.do"

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            data = await response.text()

            doc = pq(data)
            rows = doc("tr")

            for row in rows.items():
                notice_date_str = row.find("td:nth-child(4)").text().strip()
                try:
                    notice_date = datetime.strptime(notice_date_str, "%Y.%m.%d")
                except ValueError:
                    continue

                if notice_date.date() == yesterday:
                    notice_title = row.find("td:nth-child(2) strong").text().strip()
                    notice_link = (
                        "https://hufs.ac.kr"
                        + row.find("td:nth-child(2) a").attr("href").strip()
                    )

                    await Notice.create(
                        date=notice_date.strftime("%Y-%m-%d"),
                        title=notice_title,
                        link=notice_link,
                    )


async def fetch_ai_notice(url):
    yesterday = (datetime.now() - timedelta(days=1)).date()

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            data = await response.text()

            doc = pq(data)
            rows = doc("tr")

            for row in rows.items():
                notice_date_str = row.find("td:nth-child(2)").text().strip()
                try:
                    notice_date = datetime.strptime(notice_date_str, "%Y-%m-%d")
                except ValueError:
                    continue

                if notice_date.date() == yesterday:
                    notice_title = row.find("td.title a").text().strip()
                    notice_link = row.find("td.title a").attr("href")
                    notice_link = (
                        notice_link
                        if notice_link.startswith("https")
                        else "http://builder.hufs.ac.kr/user/" + notice_link
                    )

                    await Notice.create(
                        date=notice_date,
                        title=notice_title,
                        link=notice_link,
                    )


async def fetch_menu(cafeteria_id):
    today_date = datetime.now().strftime("%Y%m%d")
    url = f"https://wis.hufs.ac.kr/jsp/HUFS/cafeteria/viewWeek.jsp?startDt={today_date}&endDt={today_date}&caf_id={cafeteria_id}"

    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            data = await response.text()

            doc = pq(data)
            rows = doc("table tr[height='35']")

            menu_items = [row.text() for row in rows.items()]

            menu_data = {
                "date": today_date,
                "location": cafeteria_id,
                "menu1": (
                    menu_items[1]
                    if len(menu_items) > 1 and menu_items[0].startswith("요일/메뉴")
                    else (
                        menu_items[0]
                        if len(menu_items) > 0
                        else "등록된 메뉴가 없습니다."
                    )
                ),
                "menu2": menu_items[2] if len(menu_items) > 2 else None,
                "menu3": menu_items[3] if len(menu_items) > 3 else None,
                "menu4": menu_items[4] if len(menu_items) > 4 else None,
                "menu5": menu_items[5] if len(menu_items) > 5 else None,
            }

            await Menu.create(**menu_data)


NOTICE_HANDLERS = {
    "hufs_notice": fetch_hufs_notice,
    "ai_notice": fetch_ai_notice,
}

MENU_HANDLERS = {
    "menu": fetch_menu,
}


async def fetch_notice(url, handler_key):
    handler = NOTICE_HANDLERS.get(handler_key)
    if not handler:
        raise ValueError(f"Handler for key '{handler_key}' not found.")
    await handler(url)


async def fetch_menu_data(cafeteria_id, handler_key):
    handler = MENU_HANDLERS.get(handler_key)
    if not handler:
        raise ValueError(f"Handler for key '{handler_key}' not found.")
    await handler(cafeteria_id)


async def fetch_all_notices(notice_configs):
    for config in notice_configs:
        await fetch_notice(config["url"], config["handler_key"])


async def fetch_all_menus(cafeteria_ids):
    for cafeteria_id in cafeteria_ids:
        await fetch_menu_data(cafeteria_id, "menu")
