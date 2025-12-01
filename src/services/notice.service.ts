import { getNotices } from "../lib/kv.js";
import type {
  KakaoListCardResponse,
  KakaoErrorResponse,
} from "../types/kakao.js";

export async function getNoticesResponse(
  limit: number
): Promise<KakaoListCardResponse | KakaoErrorResponse> {
  const notices = await getNotices(limit);

  if (notices.length === 0) {
    return { error: "Notice not found" };
  }

  const items = notices.map((notice) => ({
    title: notice.title,
    description: notice.date,
    imageUrl: "https://t1.kakaocdn.net/openbuilder/sample/img_002.jpg",
    link: { web: notice.link },
  }));

  return {
    version: "2.0",
    template: {
      outputs: [
        {
          listCard: {
            header: { title: "한국외대 공지사항" },
            items,
            buttons: [
              {
                action: "webLink",
                label: "더 보기",
                webLinkUrl: "https://www.hufs.ac.kr/hufs/11281/subview.do",
              },
            ],
          },
        },
      ],
    },
  };
}
