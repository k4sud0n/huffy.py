import { Router } from "express";
import { noticeRouter } from "./notice.routes.js";
import { menuRouter } from "./menu.routes.js";
import { cronRouter } from "./cron.routes.js";

export const apiRouter = Router();

apiRouter.use(noticeRouter);
apiRouter.use(menuRouter);
apiRouter.use(cronRouter);
