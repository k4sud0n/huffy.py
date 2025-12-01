import { Router, type Request, type Response } from "express";
import { getNoticesResponse } from "../services/notice.service.js";

export const noticeRouter = Router();

async function readNotice(req: Request, res: Response): Promise<void> {
  try {
    const limitQuery = req.query.limit || req.body?.limit;
    let limit = parseInt(String(limitQuery)) || 5;

    // 입력 검증: 1-20 범위로 제한
    if (limit < 1) limit = 1;
    if (limit > 20) limit = 20;

    const response = await getNoticesResponse(limit);
    res.json(response);
  } catch (error) {
    console.error("Error in readNotice:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

noticeRouter.get("/notice", readNotice);
noticeRouter.post("/notice", readNotice);
