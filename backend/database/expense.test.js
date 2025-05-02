import { describe, it, expect, vi, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import Expense from './expense'; // adjust path if needed

vi.mock('mongoose', async () => {
  const actual = await vi.importActual('mongoose');
  return {
    ...actual,
    model: vi.fn(() => {
      return function () {
        return {
          save: vi.fn().mockResolvedValue({}),
        };
      };
    }),
  };
});

describe('Expense Model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should define the Expense model', () => {
    expect(Expense).toBeDefined();
  });

  it('should create an Expense document with required fields', async () => {
    const fakeExpense = {
      trip: new mongoose.Types.ObjectId(),
      paidBy: new mongoose.Types.ObjectId(),
      amount: 1000,
      description: 'Lunch',
      splitBetween: [new mongoose.Types.ObjectId()],
    };

    const expense = new Expense(fakeExpense);
    expect(expense.trip).toBe(fakeExpense.trip);
    expect(expense.amount).toBe(1000);
    expect(expense.description).toBe('Lunch');
  });

  it('should throw validation error for missing required fields', async () => {
    try {
      const expense = new Expense({}); // Missing required fields
      await expense.validate();
    } catch (err) {
      expect(err.errors.trip).toBeDefined();
      expect(err.errors.paidBy).toBeDefined();
      expect(err.errors.amount).toBeDefined();
    }
  });
});
