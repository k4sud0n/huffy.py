import { getMenu } from "../lib/kv.js";
import type {
  KakaoCarouselResponse,
  KakaoErrorResponse,
} from "../types/kakao.js";

export async function getMenuResponse(
  location: string
): Promise<KakaoCarouselResponse | KakaoErrorResponse> {
  const menu = await getMenu(location);

  if (!menu || menu.items.length === 0) {
    return { error: "Menu not found" };
  }

  const items = menu.items.map((item) => ({
    description: item,
  }));

  return {
    version: "2.0",
    template: {
      outputs: [
        {
          carousel: {
            type: "textCard",
            items,
          },
        },
      ],
    },
  };
}
