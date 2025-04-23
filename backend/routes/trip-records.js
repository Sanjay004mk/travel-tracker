import express from "express";

import requireAuth from "../require-auth.js";

import Trip from "../database/trip.js";

const router = express.Router();

router.post("/create", requireAuth, async (req, res) => {
    try {

        const { name, location, startDate, endDate, visibility } = req.body;
        
        if (!location || typeof location !== "string" || location.trim().length === 0) {
            return res.status(400).json({ message: "Location is required." });
        }
    
        const start = new Date(startDate);
    
        if (isNaN(start.getTime())) {
            return res.status(400).json({ message: "Invalid start or end date." });
        }
    
        let end = null;
        if (endDate) {
            end = new Date(endDate);
            if (isNaN(end.getTime())) {
                return res.status(400).json({ message: "Invalid end date." });
            }
            if (end < start) {
                return res.status(400).json({ message: "End date cannot be before start date." });
            }
        }
    
        const validVisibilities = ["public", "private", "friends-only"];
        if (!visibility || !validVisibilities.includes(visibility)) {
        return res.status(400).json({ message: `Visibility must be one of: ${validVisibilities.join(", ")}` });
        }

        const trip = new Trip({
            name,
            location,
            startDate,
            endDate,
            visibility,
            owner: req.user._id,
            participants: [req.user._id],
            admins: [req.user._id],
        });
        
        await trip.save();
        res.json({ message: "Trip created", trip });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal server error"});
    }
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
            favorited: trip.favoritedBy.includes(req.user._id),
            isAdmin: trip.admins.includes(req.user._id),
        })) 
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal server error"});
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
            isAdmin: trip.admins.includes(req.user._id),
            details: trip.details,
        }});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get('/favorite/:id-:value', requireAuth, async (req, res) => {
    try {
        const { id, value } = req.params;
        const trip = await Trip.findOne({
            tripCode: id
        });
        if (value != "false") {
            if (!trip.favoritedBy.includes(req.user._id)) {
                trip.favoritedBy.push(req.user._id);
            }
        } else {
            trip.favoritedBy = trip.favoritedBy.filter(id => !id.equals(req.user._id));
        }
        await trip.save();

        res.status(200).json({ message: "Updated favorites"});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error"});
    }
});

const requireTripAdmin = async (req, res, next) => {
    try {
        const trip = await Trip.findOne({
            tripCode: req.params.id
        })
        if (trip.admins.includes(req.user._id)) {
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

router.post('/update/:id', requireAuth, requireTripAdmin, async (req, res) => {
    try {
        const tripData = req.body;
        const trip = req.trip;
        if (!tripData.name || typeof tripData.name !== "string" || tripData.name.trim().length === 0) {
            tripData.name = trip.name;
        }
      
          if (!tripData.location || typeof tripData.location !== "string" || tripData.location.trim().length === 0) {
            tripData.location = trip.location;
        }
      
        const start = new Date(tripData.startDate);
        if (isNaN(start.getTime())) {
            return res.status(400).json({ message: "Invalid start date." });
        }
      
        let end = null;
        if (tripData.endDate) {
            end = new Date(tripData.endDate);
            if (isNaN(end.getTime())) {
                return res.status(400).json({ message: "Invalid end date." });
            }
            if (end < start) {
                return res.status(400).json({ message: "End date cannot be before start date." });
            }
        }
    
        trip.name = tripData.name.trim();
        trip.location = tripData.location.trim();
        trip.startDate = start;
        trip.endDate = end; 
        trip.details = tripData.details;

        trip.save();

        res.status(200).json({ message: "Trip updated successfully"});
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal server error"});
    }
});

router.post('/detail/new/:id', requireAuth, requireTripAdmin, async (req, res) => {
    try {
        const newDetail = req.body;
        const trip = req.trip;
        const dateParam = newDetail.date;

        const detailDate = new Date(dateParam);
        if (isNaN(detailDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format." });
        }

        const tripStart = new Date(trip.startDate);
        const tripEnd = trip.endDate ? new Date(trip.endDate) : null;

        if (detailDate < tripStart) {
            return res.status(400).json({ message: "Detail date cannot be before trip start date." });
        }
        if (tripEnd && detailDate > tripEnd) {
            return res.status(400).json({ message: "Detail date cannot be after trip end date." });
        }

        const existingDetailIndex = trip.details.findIndex(
            (d) => new Date(d.date).toDateString() === detailDate.toDateString()
        );

        if (existingDetailIndex !== -1) {
            trip.details[existingDetailIndex] = {
                ...trip.details[existingDetailIndex],
                ...newDetail,
                date: detailDate, 
            };
        } else {
            trip.details.push({
                ...newDetail,
                date: detailDate,
        });
        }
    
        trip.save();

        res.status(200).json({ message: "Added new detail"});
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal server error"});
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