import { get, getAll } from "@vercel/edge-config";

// 날짜 관련 유틸리티
export function getTodayKST(): string {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(now.getTime() + kstOffset);
  return kstDate.toISOString().split("T")[0];
}

export function getRecentDatesKST(days: number = 7): string[] {
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(d.getTime() + kstOffset);
    dates.push(kstDate.toISOString().split("T")[0]);
  }
  return dates;
}

// 공지사항 타입
export interface NoticeData {
  title: string;
  link: string;
  date: string;
}

// 메뉴 타입
export interface MenuData {
  location: string;
  date: string;
  items: string[];
}

// Edge Config 데이터 구조
export interface EdgeConfigData {
  notices: Record<string, NoticeData[]>; // { "2024-12-01": [...] }
  menus: Record<string, MenuData>; // { "학생식당:2024-12-01": {...} }
}

// Edge Config REST API로 데이터 쓰기
async function updateEdgeConfig(items: { key: string; value: unknown }[]): Promise<void> {
  const edgeConfigId = process.env.EDGE_CONFIG_ID;
  const vercelApiToken = process.env.VERCEL_API_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!edgeConfigId || !vercelApiToken) {
    throw new Error("Missing EDGE_CONFIG_ID or VERCEL_API_TOKEN");
  }

  const url = teamId
    ? `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items?teamId=${teamId}`
    : `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${vercelApiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Edge Config update failed: ${response.status} - ${errorText}`);
  }
}

// 공지사항 저장
export async function saveNotices(date: string, notices: NoticeData[]): Promise<void> {
  // 기존 데이터 가져오기
  const existing = await get<Record<string, NoticeData[]>>("notices");
  const updated = existing ? { ...existing } : {};

  // 기존 날짜 데이터와 병합
  if (updated[date]) {
    updated[date] = [...updated[date], ...notices];
  } else {
    updated[date] = notices;
  }

  // 7일 이상 된 데이터 삭제
  const recentDates = new Set(getRecentDatesKST(7));
  for (const key of Object.keys(updated)) {
    if (!recentDates.has(key)) {
      delete updated[key];
    }
  }

  await updateEdgeConfig([{ key: "notices", value: updated }]);
}

// 공지사항 조회
export async function getNotices(limit: number = 5): Promise<NoticeData[]> {
  const noticesData = await get<Record<string, NoticeData[]>>("notices");

  if (!noticesData) {
    return [];
  }

  const recentDates = getRecentDatesKST(7);
  const allNotices: NoticeData[] = [];

  for (const date of recentDates) {
    const notices = noticesData[date];
    if (notices) {
      allNotices.push(...notices);
    }
    if (allNotices.length >= limit) break;
  }

  return allNotices.slice(0, limit);
}

// 메뉴 저장
export async function saveMenu(location: string, date: string, items: string[]): Promise<void> {
  // 기존 데이터 가져오기
  const existing = await get<Record<string, MenuData>>("menus");
  const updated = existing ? { ...existing } : {};

  // 새 메뉴 추가
  const key = `${location}:${date}`;
  updated[key] = { location, date, items };

  // 7일 이상 된 데이터 삭제
  const recentDates = new Set(getRecentDatesKST(7));
  for (const menuKey of Object.keys(updated)) {
    const menuDate = menuKey.split(":").pop();
    if (menuDate && !recentDates.has(menuDate)) {
      delete updated[menuKey];
    }
  }

  await updateEdgeConfig([{ key: "menus", value: updated }]);
}

// 메뉴 조회
export async function getMenu(location: string): Promise<MenuData | null> {
  const menusData = await get<Record<string, MenuData>>("menus");

  if (!menusData) {
    return null;
  }

  const today = getTodayKST();
  const key = `${location}:${today}`;

  return menusData[key] || null;
}

// 전체 데이터 조회 (디버깅용)
export async function getAllData(): Promise<EdgeConfigData | null> {
  const data = await getAll<EdgeConfigData>();
  return data || null;
}
