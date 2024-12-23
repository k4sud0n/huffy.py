from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from fastapi import FastAPI

import crawler
from database import db_init, db_close

from menu.router import router as menu_router
from notice.router import router as notice_router


async def crawl():
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
        {
            "url": "https://builder.hufs.ac.kr/user/indexSub.action?codyMenuSeq=129898191&siteId=soft&page=1",  # AI교육원
            "handler_key": "ai_notice",
        },
    ]

    cafeteria_ids = [
        "h101",  # 인문관 식당
        "h102",  # 교수회관 식당
        "h202",  # 후생관 교직원 식당
        "h203",  # 후생관 학생 식당
        "h205",  # HufsDorm
    ]

    await crawler.fetch_all_notices(notice_configs)
    await crawler.fetch_all_menus(cafeteria_ids)


# APScheduler 설정
scheduler = AsyncIOScheduler()

# 매일 00:00에 실행
scheduler.add_job(crawl, CronTrigger(hour=0, minute=0))


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db_init()
    scheduler.start()
    await crawl()
    yield
    await db_close()


app = FastAPI(lifespan=lifespan)
app.include_router(notice_router, prefix="/api/v1", tags=["notice"])
app.include_router(menu_router, prefix="/api/v1", tags=["menu"])
