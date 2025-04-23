import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../database/user.js";

import requireAuth from "../require-auth.js";

import tripRouter from "./trip-records.js";


const router = express.Router();

router.get("/profile", requireAuth, async (req, res) => {
    res.json({ user: {
        username: req.user.username,
        email: req.user.email,
        // TODO : more attributes?
    }});
});

router.post("/register", async (req, res) => {
    try {
        const { username, password, email } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!username || username.length < 3) {
            return res.status(400).json({ message: "Username must be at least 3 characters long." });
        }

        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email address." });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long." });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username or email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, email });

        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "strict" });

        res.json({ message: "User registered successfully" });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal server error"});
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "strict" });
        res.json({ message: "Login successful" });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal server error"});
    }
});

router.get("/logout", async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true,
        secure: false,
        sameSite: "strict"
    });

    res.status(200).json({ success: true, message: "User logged out"});
});
 
router.use("/trip", tripRouter);

export default router;