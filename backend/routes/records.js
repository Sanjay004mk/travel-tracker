import express from "express";

import userRouter from "./user-records.js";
import tripRouter from "./trip-records.js";
import metricsRouter from "./metrics-records.js";

const router = express.Router();

router.use("/user", userRouter);
router.use("/trip", tripRouter);
router.use("/metrics", metricsRouter);

export default router;