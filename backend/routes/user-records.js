import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../database/user.js";
import Expense from "../database/expense.js";
import { requireAuth } from "../require-middleware.js";

const router = express.Router();
const cookieSettings = {
  httpOnly: true,
  secure: process.env.NODE_ENV == "development" ? false : true,
  sameSite: process.env.NODE_ENV == "development" ? "strict" : "none",
  partitioned: process.env.NODE_ENV == "development" ? false : true
};

router.get("/profile", requireAuth, async (req, res) => {
  const getUidName = async (id) => {
    const user = await User.findById(id);
    return { userId: id, username: user.username };
  };
  const friends = await Promise.all(req.user.friends.map(getUidName));
  const pending = await Promise.all(
    req.user.pendingFriendRequests.map(getUidName)
  );
  const sent = await Promise.all(req.user.sentFriendRequests.map(getUidName));

  res.json({
    user: {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      friends,
      pendingFriendRequests: pending,
      sentFriendRequests: sent
    }
  });
});

router.post("/friends/request", requireAuth, async (req, res) => {
  try {
    const { email } = req.body;

    const friend = await User.findOne({ email });
    if (!friend) {
      return res.status(404).json({ message: "User not found" });
    }

    if (friend.friends.includes(req.user._id)) {
      return res.status(400).json({ message: "User is already a friend" });
    }

    const user = await User.findById(req.user._id);
    console.log(friend);
    console.log(user);

    if (!user.sentFriendRequests.includes(friend._id)) {
      user.sentFriendRequests.push(friend._id);
    }
    if (!friend.pendingFriendRequests.includes(user._id)) {
      friend.pendingFriendRequests.push(user._id);
    }

    await user.save();
    await friend.save();

    return res.status(200).json({ message: "Friend request sent." });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/friends/decline", requireAuth, async (req, res) => {
  try {
    const { userId } = req.body;

    const sender = await User.findById(userId);
    if (!sender) {
      return res.status(404).json({ message: "Sender not found." });
    }

    const receiver = await User.findById(req.user._id);

    // Check if a request actually exists
    if (!sender.sentFriendRequests.includes(receiver._id)) {
      return res
        .status(400)
        .json({ message: "No pending request from this user." });
    }
    if (!receiver.pendingFriendRequests.includes(sender._id)) {
      return res
        .status(400)
        .json({ message: "No pending request from this user." });
    }

    // Remove from both arrays
    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      (id) => !id.equals(receiver._id)
    );
    receiver.pendingFriendRequests = receiver.pendingFriendRequests.filter(
      (id) => !id.equals(sender._id)
    );

    await sender.save();
    await receiver.save();

    return res.status(200).json({ message: "Friend request declined." });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/friends/add", requireAuth, async (req, res) => {
  try {
    const { userId } = req.body;

    const friend = await User.findById(userId);
    if (!friend) {
      return res.status(404).json({ message: "Friend id doesn't exist." });
    }
    const user = await User.findById(req.user._id);

    if (!friend.sentFriendRequests.includes(req.user._id)) {
      return res.status(400).json({ message: "Friend request wasn't sent." });
    }
    if (!user.pendingFriendRequests.includes(friend._id)) {
      return res.status(400).json({ message: "Friend request not found" });
    }

    if (!user.friends.includes(friend._id)) {
      user.friends.push(friend._id);
    }
    if (!friend.friends.includes(user._id)) {
      friend.friends.push(user._id);
    }

    friend.sentFriendRequests = friend.sentFriendRequests.filter(
      (id) => !id.equals(user._id)
    );
    user.pendingFriendRequests = user.pendingFriendRequests.filter(
      (id) => !id.equals(friend._id)
    );

    await user.save();
    await friend.save();

    return res.status(200).json({ message: "Added friend." });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/friends/remove", requireAuth, async (req, res) => {
  try {
    const { userId } = req.body;

    const friend = await User.findById(userId);
    if (!friend) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = await User.findById(req.user._id);

    if (!user.friends.includes(friend._id)) {
      return res
        .status(400)
        .json({ message: "You are not friends with this user." });
    }

    user.friends = user.friends.filter((id) => !id.equals(friend._id));
    friend.friends = friend.friends.filter((id) => !id.equals(user._id));

    await user.save();
    await friend.save();

    return res.status(200).json({ message: "Friend removed successfully." });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/expense", requireAuth, async (req, res) => {
  try {
    const { user } = req;

    const expenses = await Expense.find({
      $or: [{ paidBy: user._id }, { splitBetween: user._id }]
    })
      .populate("trip", "tripCode name location")
      .populate("paidBy", "username email")
      .populate("splitBetween", "username email")
      .sort({ date: -1 });

    return res.status(200).json({ expenses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!username || username.length < 3) {
      return res
        .status(400)
        .json({ message: "Username must be at least 3 characters long." });
    }

    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address." });
    }

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, email });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    res.cookie("token", token, { ...cookieSettings });

    return res.status(200).json({ message: "User registered successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error"});
  }
});

router.post("/update", requireAuth, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.findById(req.user._id);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (username && username.length >= 3) {
      user.username = username;
    }

    if (email && emailRegex.test(email)) {
      user.email = email;
    }

    if (password && password.length >= 6) {
      const { originalPassword } = req.body;
      if (!(await bcrypt.compare(originalPassword, user.password))) {
        return res.status(400).json({ message: "old password not correct." });
      }
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();
    return res.status(200).json({ message: "User details updated." });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    res.cookie("token", token, { ...cookieSettings });
    res.status(200).json({ message: "Login successful" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/logout", async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 5 * 1000),
    ...cookieSettings
  });

  res.status(200).json({ success: true, message: "User logged out" });
});

export default router;
