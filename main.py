from contextlib import asynccontextmanager

from fastapi import FastAPI

import crawler
from database import db_init, db_close

from menu.router import router as menu_router
from notice.router import router as notice_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db_init()

    notice_configs = [
        {
            "url": "11281",  # 한국외대 공지
            "handler_key": "hufs_notice",
        },
        {
            "url": "11282",  # 한국외대 학사
            "handler_key": "hufs_notice",
        },
        {
            "url": "11283",  # 한국외대 장학
            "handler_key": "hufs_notice",
        },
        {
            "url": "11284",  # 한국외대 채용
            "handler_key": "hufs_notice",
        },
    ]

    cafeteria_ids = ["h101", "h102", "h202", "h203", "h205"]

    await crawler.fetch_all_notices(notice_configs)
    await crawler.fetch_all_menus(cafeteria_ids)
    yield
    await db_close()


app = FastAPI(lifespan=lifespan)
app.include_router(notice_router, prefix="/api/v1", tags=["notice"])
app.include_router(menu_router, prefix="/api/v1", tags=["menu"])
