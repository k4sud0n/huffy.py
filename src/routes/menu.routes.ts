import { Router, type Request, type Response } from "express";
import { getMenuResponse } from "../services/menu.service.js";
import { CAFETERIA_IDS } from "../services/crawler.service.js";

export const menuRouter = Router();

// 유효한 location 화이트리스트
const VALID_LOCATIONS = new Set(CAFETERIA_IDS);

async function readMenu(req: Request, res: Response): Promise<void> {
  try {
    const { location } = req.params;

    // 입력 검증: 화이트리스트 체크
    if (!VALID_LOCATIONS.has(location)) {
      res.status(400).json({
        error: `Invalid location. Valid locations: ${CAFETERIA_IDS.join(", ")}`,
      });
      return;
    }

    const response = await getMenuResponse(location);
    res.json(response);
  } catch (error) {
    console.error("Error in readMenu:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

menuRouter.get("/menu/:location", readMenu);
menuRouter.post("/menu/:location", readMenu);
