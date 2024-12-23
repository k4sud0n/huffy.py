from fastapi import APIRouter

from models import Notice

router = APIRouter()


@router.get("/notice")
async def read_notice(limit: int = 5):
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

    return response


@router.post("/notice")
async def read_notice(limit: int = 5):
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

    return response
