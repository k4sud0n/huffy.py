from datetime import datetime, timedelta

from fastapi import APIRouter

from models import Notice

router = APIRouter()

notice_cache = {}
cache_expiry_time = None


@router.get("/notice")
@router.post("/notice")
async def read_notice(limit: int = 5):
    global cache_expiry_time

    now = datetime.now()
    today = now.date()

    if not cache_expiry_time or now >= cache_expiry_time:
        notice_cache.clear()
        cache_expiry_time = datetime.combine(
            today + timedelta(days=1), datetime.min.time()
        )

    cache_key = f"{today}"
    if cache_key in notice_cache:
        return notice_cache[cache_key]

    # 캐시가 없으면 DB에서 읽기
    notices = await Notice.all().order_by("-date")[:limit]
    if not notices:
        return {"error": "Notice not found"}

    items = [
        {
            "title": notice.title,
            "description": notice.date,
            "imageUrl": "https://t1.kakaocdn.net/openbuilder/sample/img_002.jpg",
            "link": {"web": notice.link},
        }
        for notice in notices
    ]

    response = {
        "version": "2.0",
        "template": {
            "outputs": [
                {
                    "listCard": {
                        "header": {"title": "한국외대 공지사항"},
                        "items": items,
                        "buttons": [
                            {
                                "action": "webLink",
                                "label": "더 보기",
                                "webLinkUrl": "https://www.hufs.ac.kr/hufs/11281/subview.do",
                            },
                        ],
                    }
                }
            ]
        },
    }

    notice_cache[cache_key] = response
    return response
