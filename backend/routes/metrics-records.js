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

router.get("/all-trips/expense/total", requireAuth, async (req, res) => {
  try {
    const tripExpenses = await Expense.aggregate([
      {
        $group: {
          _id: "$trip",
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $lookup: {
          from: "trips",
          localField: "_id",
          foreignField: "_id",
          as: "tripDetails"
        }
      },
      {
        $unwind: "$tripDetails"
      },
      {
        $project: {
          tripCode: "$tripDetails.tripCode",
          tripName: "$tripDetails.name",
          totalAmount: 1
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.status(200).json({ tripExpenses });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/all-trips/expense/split", requireAuth, async (req, res) => {
  try {
    const { user } = req;

    const trips = await Trip.find({ participants: user._id }).exec();

    if (!trips) {
      return res.status(404).json({ message: "Trip not found." });
    }

    const splits = {};

    for (const trip of trips) {
      const expenses = await Expense.find({ trip: trip._id })
        .populate("paidBy", "username")
        .populate("splitBetween", "username")
        .exec();

      let userExpenseSplit = {};

      expenses.forEach((expense) => {
        const paidBy = expense.paidBy.username;

        if (!userExpenseSplit[paidBy]) {
          userExpenseSplit[paidBy] = expense.amount;
        } else {
          userExpenseSplit[paidBy] += expense.amount;
        }
      });

      const expenseSplit = [];

      Object.entries(userExpenseSplit).forEach(([username, amount]) => {
        expenseSplit.push({ username, amount });
      });

      splits[trip.tripCode] = {
        tripName: trip.name,
        expenseSplit
      };
    }
    res.status(200).json({ splits });
  } catch (err) {
    console.error("Error fetching user-wise expense split:", err);
    res.status(500).json({ message: "Failed to fetch expense split." });
  }
});

router.get("/all-trips/duration", requireAuth, async (req, res) => {
  try {
    const now = new Date();

    const trips = await Trip.aggregate([
      {
        $match: {
          participants: req.user._id
        }
      },
      {
        $project: {
          tripCode: 1,
          tripName: "$name",
          startDate: 1,
          endDate: 1,
          duration: {
            $cond: [
              "$startDate",
              {
                $floor: {
                  $divide: [
                    {
                      $subtract: [{ $ifNull: ["$endDate", now] }, "$startDate"]
                    },
                    1000 * 60 * 60 * 24
                  ]
                }
              },
              null
            ]
          }
        }
      },
      {
        $sort: { duration: -1 }
      }
    ]);

    res.status(200).json({ trips });
  } catch (err) {
    console.log("Error fetching trip durations:", err);
    res.status(500).json({ message: "Failed to fetch trip durations." });
  }
});

router.get("/expense/split/:id", requireAuth, requireTrip, async (req, res) => {
  try {
    const { trip } = req;

    const expenses = await Expense.find({ trip: trip._id })
      .populate("paidBy", "username")
      .populate("splitBetween", "username")
      .exec();

    let userExpenseSplit = {};

    expenses.forEach((expense) => {
      const paidBy = expense.paidBy.username;
      const splitAmount = expense.amount / expense.splitBetween.length;

      if (!userExpenseSplit[paidBy]) {
        userExpenseSplit[paidBy] = expense.amount;
      } else {
        userExpenseSplit[paidBy] += expense.amount;
      }
    });

    const expenseSplit = [];

    Object.entries(userExpenseSplit).forEach(([username, amount]) => {
      expenseSplit.push({ username, amount });
    });

    res.status(200).json({
      tripName: trip.name,
      tripCode: trip.tripCode,
      expenseSplit
    });
  } catch (err) {
    console.error("Error fetching user-wise expense split:", err);
    res.status(500).json({ message: "Failed to fetch expense split." });
  }
});

export default router;
