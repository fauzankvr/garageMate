import mongoose, { Schema } from "mongoose";

interface Expense extends Document {
  category: string; 
  amount: number;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const ExpenseSchema = new Schema<Expense>(
  {
    category: { type: String, required: true },
    amount: { type: Number, required: true },
   date: { type: Date, required: true },
  },
  { timestamps: true }
);

export const ExpenseModel = mongoose.model<Expense>("Expense", ExpenseSchema);
export type { Expense };
