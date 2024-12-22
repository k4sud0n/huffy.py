from fastapi import APIRouter


router = APIRouter()


@router.get("/menu/{name}")
async def read_menu(name: str):
    return {"data": name}
