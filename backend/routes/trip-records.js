import express from "express";

import requireAuth from "../require-auth.js";

import Trip from "../database/trip.js";

const router = express.Router();

router.post("/create", requireAuth, async (req, res) => {
    const { name, location, startDate, endDate, visibility, completed } = req.body;
  
    const trip = new Trip({
      name,
      location,
      startDate,
      endDate,
      completed,
      visibility,
      owner: req.user._id,
      participants: [req.user._id],
    });
  
    await trip.save();
    res.json({ message: "Trip created", trip });
});
  
router.get('/', requireAuth, async (req, res) => {
    try {

        const trips = await Trip.find({
            participants: req.user._id
        });
        res.json({ trips: trips.map((trip) => ({
            name: trip.name, 
            location: trip.location, 
            startDate: trip.startDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric"}), 
            endDate: trip.endDate?.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric"}), 
            tripCode: trip.tripCode,
            favorited: trip.favoritedBy.includes(req.user._id)
        })) 
        });
    } catch {
        res.status(401).json({ message: "Failed to fetch trips" });
    }

});

router.get('/:id', requireAuth, async (req, res) => {
    try {

        const trip = await Trip.findOne({
            tripCode: req.params.id,
            participants: req.user._id
        });
        res.json({ trip: {
            name: trip.name, 
            location: trip.location, 
            startDate: trip.startDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric"}), 
            endDate: trip.endDate?.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric"}), 
            tripCode: trip.tripCode,
            favorited: trip.favoritedBy.includes(req.user._id),
            details: trip.details,
        }});
    } catch {
        res.status(401).json({ message: "Failed to fetch trip details" });
    }
});
  
// router.get('/search', requireAuth, async (req, res) => {
//     const { query } = req.query;
//     const regex = new RegExp(query, 'i');
    
//     // TODO: validate that trip is accessible to user
//     const trips = await Trip.find({
//         name: regex,
//         visibility: 'friends' 
//     }).limit(10);
    
//     res.json(trips);
// });

export default router;