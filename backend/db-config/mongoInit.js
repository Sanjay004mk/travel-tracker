import mongoose from "mongoose";
import User from "../database/user.js";
import Trip from "../database/trip.js";
import Expense from "../database/expense.js";

const mongoURI =
  process.env.MONGO_URI || "mongodb://localhost:27017/travel-tracker";

const connectWithRetry = async (retries = 5, delay = 3000) => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    if (retries === 0) {
      console.error("❌ Could not connect to MongoDB. Exiting.");
      process.exit(1);
    }
    console.log(`🔄 Retry connecting in ${delay / 1000}s...`);
    setTimeout(() => connectWithRetry(retries - 1, delay), delay);
  }
};

const seedDatabase = async () => {
  await connectWithRetry();

  try {
    await User.deleteMany({});
    await Trip.deleteMany({});
    await Expense.deleteMany({});
    console.log("Cleared existing data");

    const user1 = await User.create({
      username: "alice",
      password: "password123",
      email: "alice@example.com"
    });
    const user2 = await User.create({
      username: "bob",
      password: "password456",
      email: "bob@example.com"
    });
    const user3 = await User.create({
      username: "carol",
      password: "password789",
      email: "carol@example.com"
    });

    user1.friends.push(user2._id);
    user2.friends.push(user1._id);
    user3.pendingFriendRequests.push(user1._id);
    user1.sentFriendRequests.push(user3._id);

    await user1.save();
    await user2.save();
    await user3.save();

    const trip1 = await Trip.create({
      tripCode: "TRIP123",
      name: "Beach Getaway",
      location: "Goa",
      startDate: new Date("2025-05-15"),
      endDate: new Date("2025-05-20"),
      owner: user1._id,
      admins: [user1._id],
      participants: [user1._id, user2._id],
      favoritedBy: [user2._id],
      visibility: "friends",
      joinRequests: [user3._id],
      details: [
        {
          date: new Date("2025-05-15"),
          note: ["Checked into hotel", "Dinner by the beach"],
          location: "Baga Beach",
          activities: ["Swimming", "Bonfire"]
        }
      ]
    });

    await Expense.create([
      {
        trip: trip1._id,
        paidBy: user1._id,
        amount: 5000,
        description: "Hotel booking",
        splitBetween: [user1._id, user2._id],
        date: new Date("2025-05-14")
      },
      {
        trip: trip1._id,
        paidBy: user2._id,
        amount: 2000,
        description: "Dinner",
        splitBetween: [user1._id, user2._id],
        date: new Date("2025-05-15")
      }
    ]);

    console.log("Database seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
};

seedDatabase();
