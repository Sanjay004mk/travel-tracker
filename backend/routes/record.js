import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../database/user.js";


const router = express.Router();

router.get("/profile", async (req, res) => {

    const token = req.cookies.token;
    console.log(token);
    if (!token) 
        return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) 
            return res.status(403).json({ message: "Invalid token" });

        const user = await User.findById(decoded.userId).select("-password");
        res.json({ user });
    });
});

router.post("/register", async (req, res) => {
    try {
        const { username, password, email } = req.body;
        console.log(username, password, email);
        const existingUser = await User.exists({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, email });

        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "strict" });

        res.json({ message: "User registered successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);
        const user = await User.findOne({ email });
        console.log(user);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "strict" });
        res.json({ message: "Login successful" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;