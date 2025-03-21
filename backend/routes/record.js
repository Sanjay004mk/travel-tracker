import express from "express";

import db from "../database/connection.js";

import { ObjectId } from "mongodb";

const router = express.Router();

router.get("/", async (req, res) => {
    res.send({
            message: "Hello world"
        }).status(200);
});

export default router;