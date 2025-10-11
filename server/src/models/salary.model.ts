import mongoose, { Schema, Types, Document } from "mongoose";
import { Employee } from "./employee.model";

interface BorrowedEntry {
  date: Date;
  amount: number;
}

interface Salary extends Document {
  employee: Types.ObjectId | Employee;
  date: Date;
  baseSalary: number;
  bonus?: number;
  deduction?: number;
  borrowed: number; // Now a calculated field based on borrowedHistory
  borrowedHistory: BorrowedEntry[];
  due: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const SalarySchema = new Schema<Salary>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: Date, required: true },
    baseSalary: { type: Number, required: true },
    bonus: { type: Number, default: 0 },
    deduction: { type: Number, default: 0 },
    borrowed: { type: Number, default: 0 }, // Kept in schema for compatibility
    borrowedHistory: [
      {
        date: { type: Date, required: true },
        amount: { type: Number, required: true, min: 0 },
      },
    ],
    due: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

// Update borrowed and due amounts before saving
SalarySchema.pre("save", function (next) {
  // Calculate borrowed as the sum of borrowedHistory amounts
  this.borrowed = this.borrowedHistory.reduce(
    (sum, entry) => sum + (entry.amount || 0),
    0
  );

  // Calculate due: baseSalary + bonus - deduction - borrowed
  this.due =
    (this.baseSalary || 0) +
    (this.bonus || 0) -
    (this.deduction || 0) -
    (this.borrowed || 0);

  next();
});

export const SalaryModel = mongoose.model<Salary>("Salary", SalarySchema);
export type { Salary, BorrowedEntry };
