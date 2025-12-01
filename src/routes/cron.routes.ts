import { Router, type Request, type Response } from "express";
import { crawlAll } from "../services/crawler.service.js";

export const cronRouter = Router();

async function triggerCrawl(req: Request, res: Response): Promise<void> {
  try {
    // 인증 확인
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      res.status(500).json({ error: "CRON_SECRET not configured" });
      return;
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // 크롤링 실행
    const result = await crawlAll();

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error in triggerCrawl:", error);
    res.status(500).json({ error: "Crawl failed" });
  }
}

cronRouter.post("/cron/crawl", triggerCrawl);
