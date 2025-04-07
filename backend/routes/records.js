import express from "express";

import userRouter from "./user-records.js";
import tripRouter from "./trip-records.js";

const router = express.Router();

router.use("/user", userRouter);
router.use("/trip", tripRouter);

export default router;