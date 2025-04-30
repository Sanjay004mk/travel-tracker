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

router.get("/all-trips/expense/individual", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const trips = await Trip.find({
        participants: userId 
    }).select("_id");

    const tripIds = trips.map((trip) => trip._id);

    if (tripIds.length === 0) {
      return res.status(200).json({ users: [] });
    }

    const expenses = await Expense.aggregate([
      { $match: { trip: { $in: tripIds } } },
      {
        $group: {
          _id: "$paidBy",
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 0,
          userId: "$userDetails._id",
          username: "$userDetails.username",
          totalAmount: 1
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.status(200).json({ users: expenses });

  } catch (err) {
    console.error("Error fetching individual expenses:", err);
    res.status(500).json({ message: "Failed to fetch individual expenses." });
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

router.get("/friends/common", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate("friends", "username")
      .exec();

    const friends = user.friends;

    const results = await Promise.all(
      friends.map(async (friend) => {
        const tripsInCommon = await Trip.countDocuments({
          participants: { $all: [userId, friend._id] }
        });

        return {
          username: friend.username,
          trips: tripsInCommon
        };
      })
    );

    res.status(200).json({ friends: results });

  } catch (err) {
    console.error("Error fetching common trips:", err);
    res.status(500).json({ message: "Failed to fetch friends' common trips." });
  }
});

export default router;
