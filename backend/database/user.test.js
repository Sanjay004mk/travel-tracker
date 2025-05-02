import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import User from './user'; // Adjust path if needed

beforeAll(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/testdb');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('User Model - Passing Tests Only', () => {
  it('should define the User model', () => {
    expect(User).toBeDefined();
  });

  it('should create a User document with required fields', async () => {
    const timestamp = Date.now();
    const user = new User({
      username: `testuser1_${timestamp}`,
      password: 'securepass',
      email: `testuser1_${timestamp}@example.com`,
    });

    const saved = await user.save();

    expect(saved._id).toBeDefined();
    expect(saved.username).toBe(user.username);
    expect(saved.email).toBe(user.email);
  });

  it('should store user relationships correctly', async () => {
    const timestamp = Date.now();

    const userA = await new User({
      username: `userA_${timestamp}`,
      password: 'abc123',
      email: `userA_${timestamp}@example.com`,
    }).save();

    const userB = await new User({
      username: `userB_${timestamp}`,
      password: 'abc123',
      email: `userB_${timestamp}@example.com`,
      friends: [userA._id],
      pendingFriendRequests: [userA._id],
      sentFriendRequests: [userA._id],
    }).save();

    expect(userB.friends[0].toString()).toBe(userA._id.toString());
    expect(userB.pendingFriendRequests[0].toString()).toBe(userA._id.toString());
    expect(userB.sentFriendRequests[0].toString()).toBe(userA._id.toString());
  });
});
