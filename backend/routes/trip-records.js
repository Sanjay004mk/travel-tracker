import express from "express";

import requireAuth from "../require-auth.js";

import Trip from "../database/trip.js";
import User from "../database/user.js";

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
        const getTripDetails = (trip) => ({
            name: trip.name, 
            location: trip.location, 
            startDate: trip.startDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric"}), 
            endDate: trip.endDate?.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric"}), 
            completed: trip.endDate ? true : false,
            tripCode: trip.tripCode,
            favorited: trip.favoritedBy.includes(req.user._id),
            isAdmin: trip.admins.includes(req.user._id),
        });
        const trips = await Trip.find({
            participants: req.user._id
        });
        const shared = await Trip.find({
            sharedWith: req.user._id
        });
        const joinRequests = await Trip.find({
            joinRequests: req.user._id
        });
        res.json({ 
            trips: trips.map(trip => getTripDetails(trip)),
            joinRequests: joinRequests.map(trip => getTripDetails(trip)),
            shared: shared.map(trip => getTripDetails(trip)),
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
        const getUidName = async (id) => {
            const user = await User.findById(id);
            return { userId: id, username: user.username };
        };
        const participants = await Promise.all(trip.participants.map(getUidName));
        const joinRequests = await Promise.all(trip.joinRequests.map(getUidName));
        const sharedWith = await Promise.all(trip.sharedWith.map(getUidName));
        res.json({ trip: {
            name: trip.name, 
            location: trip.location, 
            startDate: trip.startDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric"}), 
            endDate: trip.endDate?.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric"}), 
            completed: trip.endDate ? true : false,
            tripCode: trip.tripCode,
            favorited: trip.favoritedBy.includes(req.user._id),
            isAdmin: trip.admins.includes(req.user._id),
            visibility: trip.visibility,
            details: trip.details.map(detail => ({date: detail.date, location: detail.location})),
            participants,
            joinRequests,
            sharedWith,
        }});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post('/join', requireAuth, async (req, res) => {
    const { tripCode, name } = req.body;
    const userId = req.user._id; 

    try {
        let trip;
        if (tripCode) {
            trip = await Trip.findOne({ tripCode });
        } else if (name) {
            trip = await Trip.findOne({ name });
        }

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (trip.participants.includes(userId)) {
            return res.status(400).json({ message: 'You are already a participant in this trip' });
        }

        const user = await User.findById(userId);
        const friends = user.friends.map(friend => friend.toString());
        const tripParticipants = trip.participants.map(participant => participant.toString());
        const sharedWith = trip.sharedWith.map(user => user.toString());
        const commonFriends = tripParticipants.filter(participant => friends.includes(participant));

        if ((commonFriends.length > 0 && trip.visibility === 'friends') || (sharedWith.includes(user._id.toString()))) {
            trip.participants.push(userId);

            if (sharedWith.includes(user._id.toString())) {
                trip.sharedWith = trip.sharedWith.filter(sharedUser => !sharedUser.equals(user._id));
            }

            await trip.save();
            return res.status(200).json({ message: 'You have been added as a participant' });
        }

        if (commonFriends.length > 0) {
            trip.joinRequests.push(userId);
            await trip.save();
    
            return res.status(200).json({ message: 'Your join request has been submitted' });
        }

        return res.status(400).json({ message: 'You do not have permission to join this trip' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/add/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { userId, email } = req.body; 

    try {
        const trip = await Trip.findOne({ tripCode: id, participants: req.user._id });
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        let user;
        if (userId) {
            user = await User.findById(userId);
        } 
        if (email) {
            user = await User.findOne({ email });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (trip.participants.includes(user._id)) {
            return res.status(400).json({ message: 'User is already part of the trip' });
        }
        if (!trip.joinRequests.includes(user._id)) {
            return res.status(400).json({ message: 'User not invited to join' });
        }

        trip.joinRequests = trip.joinRequests.filter(id => !id.equals(user._id));
        trip.sharedWith = trip.sharedWith.filter(id => !id.equals(user._id));
        trip.participants.push(user._id);
    
        await trip.save();

        return res.status(200).json({ message: 'User has been successfully invited to the trip' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/invite/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { userId, email } = req.body; 

    try {
        const trip = await Trip.findOne({ tripCode: id, participants: req.user._id });
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        let user;
        if (userId) {
            user = await User.findById(userId);
        } 
        if (email) {
            user = await User.findOne({ email });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (trip.participants.includes(user._id) || trip.sharedWith.includes(user._id)) {
            return res.status(400).json({ message: 'User is already invited or part of the trip' });
        }
        trip.sharedWith.push(user._id);
    
        await trip.save();

        return res.status(200).json({ message: 'User has been successfully invited to the trip' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/leave/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id; 

    try {
        const trip = await Trip.findOne({ tripCode: id });
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (trip.sharedWith.includes(userId)) {
            trip.sharedWith = trip.sharedWith.filter(user => user.toString() !== userId.toString());
            res.status(200).json({ message: 'You have left the trip (sharedWith)' });
        }

        if (trip.joinRequests.includes(userId)) {
            trip.joinRequests = trip.joinRequests.filter(user => user.toString() !== userId.toString());
            res.status(200).json({ message: 'You have left the trip (joinRequests)' });
        }

        if (trip.participants.includes(userId)) {
            trip.participants = trip.participants.filter(user => user.toString() !== userId.toString());
            res.status(200).json({ message: 'You have left the trip (participants)' });
        }

        if (res.statusCode == 200) {
            await trip.save();
            return;
        }

        return res.status(400).json({ message: 'You are not part of this trip' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/remove/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body; 

    try {
        const trip = await Trip.findOne({ tripCode: id, admins: req.user._id });
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (trip.sharedWith.includes(userId)) {
            trip.sharedWith = trip.sharedWith.filter(user => user.toString() !== userId.toString());
            res.status(200).json({ message: 'Removed from trip (sharedWith)' });
        }

        if (trip.joinRequests.includes(userId)) {
            trip.joinRequests = trip.joinRequests.filter(user => user.toString() !== userId.toString());
            res.status(200).json({ message: 'Removed from trip (joinRequests)' });
        }

        if (trip.participants.includes(userId)) {
            trip.participants = trip.participants.filter(user => user.toString() !== userId.toString());
            res.status(200).json({ message: 'Removed from trip (participants)' });
        }

        if (res.statusCode == 200) {
            await trip.save();
            return;
        }

        return res.status(400).json({ message: 'You are not part of this trip' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal server error' });
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

router.get("/details/:date/:id", async (req, res) => {
    const { date, id } = req.params;
  
    try {
      const trip = await Trip.findOne({
        tripCode: id
      });
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }
  
      const requestedDate = new Date(date);
      if (isNaN(requestedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date"});
      }

      const detail = trip.details.find(d => 
        new Date(d.date).toDateString() === requestedDate.toDateString()
      );
  
      if (!detail) {
        return res.status(404).json({ message: "No details for this date" });
      }
  
      return res.json({ detail });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

const requireTrip = async (req, res, next) => {
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

const requireTripAdmin = async (req, res, next) => {
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

        if (!tripData.visibility || typeof tripData.visibility !== "string" || tripData.visibility.trim().length === 0 || (tripData.visibility !== "private" && tripData.visibility !== "friends")) {
            tripData.visibility = trip.visibility;
        }
    
        trip.name = tripData.name.trim();
        trip.location = tripData.location.trim();
        trip.startDate = start;
        trip.endDate = end; 
        trip.details = tripData.details;
        trip.visibility = tripData.visibility;

        trip.save();

        res.status(200).json({ message: "Trip updated successfully"});
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Internal server error"});
    }
});

router.post('/detail/new/:id', requireAuth, requireTrip, async (req, res) => {
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
            const existingDetail = trip.details[existingDetailIndex];
        
            const existingNotes = Array.isArray(existingDetail.note)
                ? existingDetail.note
                : existingDetail.note
                ? [existingDetail.note]
                : [];
        
            const newNotes = Array.isArray(newDetail.note)
                ? newDetail.note
                : newDetail.note
                ? [newDetail.note]
                : [];
        
            const existingActivities = Array.isArray(existingDetail.activities)
                ? existingDetail.activities
                : existingDetail.activities
                ? [existingDetail.activities]
                : [];
        
            const newActivities = Array.isArray(newDetail.activities)
            ? newDetail.activities
            : newDetail.activities
            ? [newDetail.activities]
            : [];
        
            existingDetail.note = [...existingNotes, ...newNotes];
            existingDetail.activities = [...existingActivities, ...newActivities];
        
            existingDetail.location = newDetail.location || existingDetail.location;
            existingDetail.date = detailDate;
        } else {
            if (!newDetail.location || typeof newDetail.location !== 'string' || newDetail.location.trim().length === 0) {
                return res.status(400).json({ message: "Location not provided"});
            }

            newDetail.note = Array.isArray(newDetail.note) ?
                newDetail.note :
                newDetail.note.trim().length !== 0 ?
                [newDetail.note] :
                [];

            newDetail.activities = Array.isArray(newDetail.activities) ?
                newDetail.activities :
                newDetail.activities.trim().length !== 0 ?
                [newDetail.activities] :
                [];

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

router.post('/details/edit/:id', requireAuth, requireTrip, async (req, res) => {
    const { id } = req.params;
    const { from, to, date } = req.body;
  
    if (isNaN(new Date(date).getTime())) {
      return res.status(400).json({ message: 'Invalid date.' });
    }
  
    if (!from || !to) {
      return res.status(400).json({ message: 'Badly formed request.' });
    }
  
    try {
      const trip = await Trip.findOne({ tripCode: id });
  
      if (!trip) {
        return res.status(404).json({ message: 'Trip not found.' });
      }
  
      const detail = trip.details.find(d => new Date(d.date).toDateString() === new Date(date).toDateString());
  
      if (!detail) {
        return res.status(404).json({ message: 'No details found for the given date.' });
      }
  
      if (from.note) {
        if (!detail.note.includes(from.note)) {
          return res.status(400).json({ message: 'Original note not found.' });
        }
        const noteIndex = detail.note.indexOf(from.note);
        if (!to.note || typeof to.note !== 'string' || to.note.trim().length == 0) {
            return res.status(400).json({ message: 'New Note cannot be empty.'});
        }
        detail.note[noteIndex] = to.note;
      }
  
      if (from.activities) {
        if (!detail.activities.includes(from.activities)) {
          return res.status(400).json({ message: 'Original activity not found.' });
        }
        const activityIndex = detail.activities.indexOf(from.activities);
        if (!to.activities || typeof to.activities !== 'string' || to.activities.trim().length == 0) {
            return res.status(400).json({ message: 'New activity cannot be empty.'});
        }
        detail.activities[activityIndex] = to.activities;
      }
  
      await trip.save();
  
      res.status(200).json({ message: 'Detail updated successfully.' });
  
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;