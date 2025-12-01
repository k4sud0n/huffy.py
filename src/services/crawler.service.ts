import axios from "axios";
import * as cheerio from "cheerio";
import {
  saveNotices,
  saveMenu,
  getTodayKST,
  type NoticeData,
} from "../lib/edge-config.js";

// 어제 날짜 (KST)
function getYesterdayKST(): string {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(now.getTime() + kstOffset - 24 * 60 * 60 * 1000);
  return kstDate.toISOString().split("T")[0];
}

// 타임아웃 설정 (5초)
const axiosInstance = axios.create({
  timeout: 5000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  },
});

interface NoticeConfig {
  url: string;
  handler_key: "hufs_notice" | "ai_notice";
}

// 한국외대 공지 크롤링
async function fetchHufsNotice(urlId: string): Promise<NoticeData[]> {
  const yesterday = getYesterdayKST();
  const yesterdayFormatted = yesterday.replace(/-/g, ".");

  const url = `https://www.hufs.ac.kr/hufs/${urlId}/subview.do`;

  try {
    const response = await axiosInstance.get(url);
    const $ = cheerio.load(response.data);
    const notices: NoticeData[] = [];

    $("tr").each((_, row) => {
      const noticeDateStr = $(row).find("td:nth-child(4)").text().trim();
      const dateMatch = noticeDateStr.match(/(\d{4})\.(\d{2})\.(\d{2})/);

      if (!dateMatch) return;

      const noticeDate = `${dateMatch[1]}.${dateMatch[2]}.${dateMatch[3]}`;

      if (noticeDate === yesterdayFormatted) {
        const noticeTitle = $(row).find("td:nth-child(2) strong").text().trim();
        const href = $(row).find("td:nth-child(2) a").attr("href")?.trim();
        const noticeLink = href ? `https://hufs.ac.kr${href}` : "";

        if (noticeTitle && noticeLink) {
          notices.push({
            title: noticeTitle,
            link: noticeLink,
            date: yesterday,
          });
        }
      }
    });

    return notices;
  } catch (error) {
    console.error(`Error fetching HUFS notice ${urlId}:`, error);
    return [];
  }
}

// AI교육원 공지 크롤링
async function fetchAiNotice(url: string): Promise<NoticeData[]> {
  const yesterday = getYesterdayKST();

  try {
    const response = await axiosInstance.get(url);
    const $ = cheerio.load(response.data);
    const notices: NoticeData[] = [];

    $("tr").each((_, row) => {
      const noticeDateStr = $(row).find("td:nth-child(2)").text().trim();

      if (!/^\d{4}-\d{2}-\d{2}$/.test(noticeDateStr)) return;

      if (noticeDateStr === yesterday) {
        const noticeTitle = $(row).find("td.title a").text().trim();
        let noticeLink = $(row).find("td.title a").attr("href") || "";

        if (!noticeLink.startsWith("https")) {
          noticeLink = `http://builder.hufs.ac.kr/user/${noticeLink}`;
        }

        if (noticeTitle && noticeLink) {
          notices.push({
            title: noticeTitle,
            link: noticeLink,
            date: yesterday,
          });
        }
      }
    });

    return notices;
  } catch (error) {
    console.error("Error fetching AI notice:", error);
    return [];
  }
}

// 메뉴 크롤링
async function fetchMenu(
  cafeteriaId: string
): Promise<{ location: string; items: string[] }> {
  const today = getTodayKST();
  const todayStr = today.replace(/-/g, "");

  const url = `https://wis.hufs.ac.kr/jsp/HUFS/cafeteria/viewWeek.jsp?startDt=${todayStr}&endDt=${todayStr}&caf_id=${cafeteriaId}`;

  try {
    const response = await axiosInstance.get(url);
    const $ = cheerio.load(response.data);

    const menuItems: string[] = [];
    $("table tr[height='35']").each((_, row) => {
      const text = $(row).text().trim();
      if (text) {
        menuItems.push(text);
      }
    });

    // Skip header row if exists
    const startIndex =
      menuItems.length > 0 && menuItems[0].startsWith("요일/메뉴") ? 1 : 0;
    const items = menuItems.slice(startIndex, startIndex + 5);

    if (items.length === 0) {
      items.push("등록된 메뉴가 없습니다.");
    }

    return { location: cafeteriaId, items };
  } catch (error) {
    console.error(`Error fetching menu ${cafeteriaId}:`, error);
    return { location: cafeteriaId, items: ["메뉴를 불러올 수 없습니다."] };
  }
}

// 공지사항 설정
const NOTICE_CONFIGS: NoticeConfig[] = [
  { url: "11281", handler_key: "hufs_notice" },
  { url: "11282", handler_key: "hufs_notice" },
  { url: "11283", handler_key: "hufs_notice" },
  { url: "11284", handler_key: "hufs_notice" },
  {
    url: "https://builder.hufs.ac.kr/user/indexSub.action?codyMenuSeq=129898191&siteId=soft&page=1",
    handler_key: "ai_notice",
  },
];

// 카페테리아 ID
const CAFETERIA_IDS = ["h101", "h102", "h202", "h203", "h205"];

// 핸들러 매핑
const NOTICE_HANDLERS: Record<string, (url: string) => Promise<NoticeData[]>> =
  {
    hufs_notice: fetchHufsNotice,
    ai_notice: fetchAiNotice,
  };

// 전체 크롤링 (병렬 처리)
export async function crawlAll(): Promise<{
  notices: number;
  menus: number;
  errors: string[];
}> {
  console.log("Starting crawl job...");
  const errors: string[] = [];
  const yesterday = getYesterdayKST();
  const today = getTodayKST();

  // 공지사항 병렬 크롤링
  const noticePromises = NOTICE_CONFIGS.map(async (config) => {
    try {
      const handler = NOTICE_HANDLERS[config.handler_key];
      return await handler(config.url);
    } catch (error) {
      errors.push(`Notice ${config.url}: ${error}`);
      return [];
    }
  });

  // 메뉴 병렬 크롤링
  const menuPromises = CAFETERIA_IDS.map(async (cafeteriaId) => {
    try {
      return await fetchMenu(cafeteriaId);
    } catch (error) {
      errors.push(`Menu ${cafeteriaId}: ${error}`);
      return { location: cafeteriaId, items: ["메뉴를 불러올 수 없습니다."] };
    }
  });

  // 병렬 실행
  const [noticeResults, menuResults] = await Promise.all([
    Promise.all(noticePromises),
    Promise.all(menuPromises),
  ]);

  // 공지사항 저장
  const allNotices = noticeResults.flat();
  if (allNotices.length > 0) {
    await saveNotices(yesterday, allNotices);
  }

  // 메뉴 저장
  for (const menu of menuResults) {
    await saveMenu(menu.location, today, menu.items);
  }

  console.log(
    `Crawl completed: ${allNotices.length} notices, ${menuResults.length} menus`
  );

  return {
    notices: allNotices.length,
    menus: menuResults.length,
    errors,
  };
}

export { CAFETERIA_IDS };
