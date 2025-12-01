import { kv } from "@vercel/kv";

// 날짜 관련 유틸리티
export function getTodayKST(): string {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(now.getTime() + kstOffset);
  return kstDate.toISOString().split("T")[0];
}

export function getYesterdayKST(): string {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const kstDate = new Date(now.getTime() + kstOffset - 24 * 60 * 60 * 1000);
  return kstDate.toISOString().split("T")[0];
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

// TTL 상수 (초 단위)
const NOTICE_TTL = 7 * 24 * 60 * 60; // 7일
const MENU_TTL = 24 * 60 * 60; // 24시간

// 공지사항 키 생성
function getNoticeKey(date: string): string {
  return `notices:${date}`;
}

// 메뉴 키 생성
function getMenuKey(location: string, date: string): string {
  return `menu:${location}:${date}`;
}

// 공지사항 저장
export async function saveNotices(
  date: string,
  notices: NoticeData[]
): Promise<void> {
  const key = getNoticeKey(date);
  const existing = await kv.get<NoticeData[]>(key);
  const merged = existing ? [...existing, ...notices] : notices;
  await kv.set(key, merged, { ex: NOTICE_TTL });
}

// 공지사항 조회
export async function getNotices(limit: number = 5): Promise<NoticeData[]> {
  const today = getTodayKST();
  const dates: string[] = [];

  // 최근 7일간의 키 생성
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstDate = new Date(d.getTime() + kstOffset);
    dates.push(kstDate.toISOString().split("T")[0]);
  }

  const allNotices: NoticeData[] = [];

  for (const date of dates) {
    const notices = await kv.get<NoticeData[]>(getNoticeKey(date));
    if (notices) {
      allNotices.push(...notices);
    }
    if (allNotices.length >= limit) break;
  }

  return allNotices.slice(0, limit);
}

// 메뉴 저장
export async function saveMenu(
  location: string,
  date: string,
  items: string[]
): Promise<void> {
  const key = getMenuKey(location, date);
  const menuData: MenuData = { location, date, items };
  await kv.set(key, menuData, { ex: MENU_TTL });
}

// 메뉴 조회
export async function getMenu(location: string): Promise<MenuData | null> {
  const today = getTodayKST();
  const key = getMenuKey(location, today);
  return kv.get<MenuData>(key);
}

export { kv };
