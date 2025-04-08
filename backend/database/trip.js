import mongoose from "mongoose";
import { Schema } from "mongoose";

const TripSchema = new mongoose.Schema({
    tripCode: { type: String, unique: true },
    name: { type: String },
    location: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date }, 
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    favoritedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    visibility: { type: String, enum: ['private', 'friends'], default: 'private' },
    joinRequests: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    details: [{
        date: { type: Date },
        note: { type: String },
        photos: [String], 
        locationTag: { type: String },
        activities: [String],
    }],
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });
  
TripSchema.pre('save', async function (next) {        
    if (!this.name) 
        this.name = this.location + " trip";

    if (this.tripCode)
        return next();

    let code;
    let isUnique = false;

    while (!isUnique) {
        code = Math.random().toString(36).substr(2, 6).toUpperCase();
        const existing = await mongoose.models.Trip.findOne({ tripCode: code });
        if (!existing) 
            isUnique = true;
    }

    this.tripCode = code;

    next();
});

const Trip = mongoose.model("Trip", TripSchema);

export default Trip;
  