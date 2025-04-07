import mongoose from "mongoose";
import { Schema } from "mongoose";

const ExpenseSchema = new mongoose.Schema({
    trip: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
    paidBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    description: { type: String },
    splitBetween: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    date: { type: Date, default: Date.now },
}, { timestamps: true });

const Expense = mongoose.model("Expense", ExpenseSchema);

export default Expense;
  
