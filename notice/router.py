from fastapi import APIRouter

router = APIRouter()


@router.get("/notice")
async def read_notice(limit: int = 5):
    return {"message": limit}
