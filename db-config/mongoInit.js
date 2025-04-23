import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../backend/database/user.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/travel-tracker";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", async () => {
  console.log("Connected to MongoDB ✅");

  try {
    await User.deleteMany({});
    console.log("Cleared existing users 🧹");

    const saltRounds = 10;

    const user1 = new User({
      username: "alice",
      password: await bcrypt.hash("password123", saltRounds),
      email: "alice@example.com",
    });

    const user2 = new User({
      username: "bob",
      password: await bcrypt.hash("password456", saltRounds),
      email: "bob@example.com",
    });

    const user3 = new User({
      username: "charlie",
      password: await bcrypt.hash("password789", saltRounds),
      email: "charlie@example.com",
    });

    // Save users
    await user1.save();
    await user2.save();
    await user3.save();

    console.log("Sample users created");

  } catch (error) {
    console.error("Error seeding users:", error);
  } finally {
    mongoose.connection.close();
  }
});
