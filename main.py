from contextlib import asynccontextmanager

from fastapi import FastAPI
from database import db_init, db_close

from menu.router import router as menu_router
from notice.router import router as notice_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db_init()
    yield
    await db_close()


app = FastAPI(lifespan=lifespan)

app.include_router(menu_router, prefix="/api/v1", tags=["menu"])
app.include_router(notice_router, prefix="/api/v1", tags=["notice"])
