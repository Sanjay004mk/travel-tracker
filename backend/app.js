import express from "express";
import cors from "cors";
import records from "./routes/record.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/", records);

export default app;