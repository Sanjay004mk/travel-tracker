import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import records from "./routes/records.js";

const app = express();

app.use(cors({ origin: process.env.FRONT_END_URL || "http://localhost:5173", credentials: true}));
app.use(express.json());
app.use(cookieParser());
app.use("/", records);

export default app;