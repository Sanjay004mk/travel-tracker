import jwt from "jsonwebtoken";
import User from "./database/user.js";
import Trip from "./database/trip.js";

export async function requireAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export async function requireTrip(req, res, next) {
    try {
        const trip = await Trip.findOne({
            tripCode: req.params.id,
            participants: req.user._id
        })
        if (trip) {
            req.trip = trip;
            next();
        }
        else
            res.status(400).json({ message: "Permission denied"});
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal server error"});
    }
}

export async function requireTripAdmin(req, res, next) {
    try {
        const trip = await Trip.findOne({
            tripCode: req.params.id,
            admins: req.user._id
        })
        if (trip) {
            req.trip = trip;
            next();
        }
        else
            res.status(400).json({ message: "Permission denied"});
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal server error"});
    }
}
