import express from "express";

import {
  requireAuth,
  requireTrip,
  requireTripAdmin
} from "../require-middleware.js";

import Trip from "../database/trip.js";
import User from "../database/user.js";
import Expense from "../database/expense.js";

const router = express.Router();

router.get("/:id", requireAuth, requireTrip, async (req, res) => {
  try {
    console.log('get called');
    const { trip } = req;

    const expenses = await Expense.find({ trip: trip._id })
      .populate("paidBy", "username email")
      .populate("splitBetween", "username email")
      .sort({ date: -1 });

    return res.status(200).json({ expenses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/add/:id", requireAuth, requireTrip, async (req, res) => {
  try {
    const { paidBy, splitBetween, amount, description, date } = req.body;
    const { trip } = req;

    const paidByUser = await User.findOne({ username: paidBy });
    if (!paidByUser) {
      return res.status(400).json({ message: "user not found" });
    }
    const splitBetweenUsers = await Promise.all(
      splitBetween.map(async (username) => {
        const user = await User.findOne({ username });
        if (!user) {
          return null;
        }
        return user._id;
      })
    );
    if (splitBetweenUsers.includes(null)) {
      return res.status(400).json({ message: "invalid user" });
    }

    if (!isFinite(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Invalid amount. Must be a positive number." });
    }

    const detailDate = new Date(date);
    if (isNaN(detailDate.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const tripStart = new Date(trip.startDate);

    if (detailDate < tripStart) {
      return res
        .status(400)
        .json({ message: "Detail date cannot be before trip start date." });
    }

    const isPaidByInTrip = trip.participants.includes(paidByUser._id);
    const areAllSplitBetweenInTrip = splitBetweenUsers.every((userId) =>
      trip.participants.includes(userId)
    );

    if (!isPaidByInTrip || !areAllSplitBetweenInTrip) {
      return res.status(400).json({
        message: "All users involved must be participants of the trip."
      });
    }

    const newExpense = new Expense({
      trip: trip._id,
      paidBy: paidByUser._id,
      amount,
      description,
      splitBetween: splitBetweenUsers,
      date
    });

    await newExpense.save();

    return res.status(200).json({ message: "Expense added successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/edit/:id", requireAuth, requireTripAdmin, async (req, res) => {
  try {
    const { transactionId, paidBy, splitBetween, amount, description, date } =
      req.body;
    const { trip } = req;

    const paidByUser = await User.findOne({ username: paidBy });
    if (!paidByUser) {
      return res.status(400).json({ message: "user not found" });
    }
    const splitBetweenUsers = await Promise.all(
      splitBetween.map(async (username) => {
        const user = await User.findOne({ username });
        if (!user) {
          return null;
        }
        return user._id;
      })
    );
    if (splitBetweenUsers.includes(null)) {
      return res.status(400).json({ message: "invalid user" });
    }

    if (!transactionId) {
      return res.status(400).json({ message: "Transaction ID is required." });
    }

    if (!isFinite(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ message: "Invalid amount. Must be a positive number." });
    }

    const detailDate = new Date(date);
    if (isNaN(detailDate.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const tripStart = new Date(trip.startDate);

    if (detailDate < tripStart) {
      return res
        .status(400)
        .json({ message: "Detail date cannot be before trip start date." });
    }

    const isPaidByInTrip = trip.participants.includes(paidByUser._id);
    const areAllSplitBetweenInTrip = splitBetweenUsers.every((userId) =>
      trip.participants.includes(userId)
    );

    if (!isPaidByInTrip || !areAllSplitBetweenInTrip) {
      return res.status(400).json({
        message: "All users involved must be participants of the trip."
      });
    }

    const expense = await Expense.findOne({
      _id: transactionId,
      trip: trip._id
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    expense.paidBy = paidByUser._id;
    expense.splitBetween = splitBetweenUsers;
    expense.amount = amount;
    expense.description = description;
    expense.date = date || expense.date;

    await expense.save();

    return res.status(200).json({ message: "Expense updated successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
