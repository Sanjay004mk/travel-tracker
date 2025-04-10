import express from "express";

import requireAuth from "../require-auth.js";

import Trip from "../database/trip.js";

const router = express.Router();

router.post("/create", requireAuth, async (req, res) => {
    try {

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
            admins: [req.user._id],
        });
        
        await trip.save();
        res.json({ message: "Trip created", trip });
    } catch (e) {
        console.error(e);
        res.status(401).json({ message: "Failed to create trip"});
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
            isAdmin: trip.admins.includes(req.user._id),
            details: trip.details,
        }});
    } catch {
        res.status(401).json({ message: "Failed to fetch trip details" });
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
        res.status(401).json({ message: "Failed to update status"});
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
        res.status(400).json({ message: "Not permitted to modify"});
    } catch (e) {
        console.error(e);
        res.status(401).json({ message: "Failed to validate admin status"});
    }
}

router.post('/update/:id', requireAuth, requireTripAdmin, async (req, res) => {
    try {
        const tripData = req.body;

        const trip = req.trip;

        trip.name = tripData.name;
        trip.location = tripData.location;
        trip.startDate = tripData.startDate;
        trip.endDate = tripData.endDate ? tripData.endDate : "";
        trip.details = tripData.details;

        trip.save();

        console.log(trip);

        res.status(200).json({ message: "Trip updated successfully"});
    } catch (e) {
        console.error(e);
        res.status(401).json({ message: "Failed to update detail"});
    }
});

router.post('/detail/new/:id', requireAuth, requireTripAdmin, async (req, res) => {
    try {
        const details = req.body;
        const trip = req.trip;
        trip.details.push(details);
    
        trip.save();

        res.status(200).json({ message: "Added new detail"});
    } catch (e) {
        console.error(e);
        res.status(401).json({ message: "Failed to add new detail"});
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