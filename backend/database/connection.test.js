import { describe, it, expect, vi, afterEach } from 'vitest';
import mongoose from 'mongoose';
import connectDB from './connection'; // Adjust path if needed

vi.mock('mongoose', () => ({
  default: {
    connect: vi.fn(),
  },
}));

describe('connectDB', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should connect to MongoDB successfully', async () => {
    mongoose.connect.mockResolvedValueOnce();

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);

    expect(logSpy).toHaveBeenCalledWith('MongoDB connected');
  });

  it('should handle connection error', async () => {
    const mockError = new Error('Connection failed');
    mongoose.connect.mockRejectedValueOnce(mockError);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});

    await connectDB();

    expect(errorSpy).toHaveBeenCalledWith(' MongoDB connection error:', mockError);
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
  });
});
