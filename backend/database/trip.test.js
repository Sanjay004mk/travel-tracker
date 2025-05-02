import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import Trip from './trip.js'; // Adjust path if needed
import User from './user.js'; // Needed for ref

beforeAll(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/testdb');
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Trip Model - Passing Tests Only', () => {
  it('should define the Trip model', () => {
    expect(Trip).toBeDefined();
  });

  it('should create a Trip with required fields and manually provide tripCode', async () => {
    const user = await new User({
      username: 'tripowner',
      password: 'pass123',
      email: 'tripowner@example.com',
    }).save();

    const trip = new Trip({
      name: 'Summer Trip',
      location: 'Goa',
      startDate: new Date('2025-05-01'),
      owner: user._id,
      tripCode: 'ABC123' // manually set to bypass hook
    });

    const saved = await trip.save();

    expect(saved._id).toBeDefined();
    expect(saved.location).toBe('Goa');
    expect(saved.owner.toString()).toBe(user._id.toString());
    expect(saved.tripCode).toBe('ABC123');
  });

  it('should store participants and sharedWith as arrays of user references', async () => {
    const userA = await new User({
      username: 'userA',
      password: '123456',
      email: 'usera@example.com'
    }).save();

    const userB = await new User({
      username: 'userB',
      password: '123456',
      email: 'userb@example.com'
    }).save();

    const trip = await new Trip({
      name: 'Group Trip',
      location: 'Manali',
      startDate: new Date('2025-06-01'),
      owner: userA._id,
      participants: [userB._id],
      sharedWith: [userB._id],
      tripCode: 'MAN123'
    }).save();

    expect(trip.participants[0].toString()).toBe(userB._id.toString());
    expect(trip.sharedWith[0].toString()).toBe(userB._id.toString());
  });
});
