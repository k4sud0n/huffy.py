import express from "express";
import { apiRouter } from "./routes/index.js";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", apiRouter);
