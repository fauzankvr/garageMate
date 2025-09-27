import mongoose, { Schema, Types } from "mongoose";
import { Employee } from "./employee.model";

interface Salary extends Document {
  employee: Types.ObjectId | Employee; // Union type to handle both populated and unpopulated states
  month: string; // e.g., "2025-09"
  baseSalary: number;
  bonus?: number;
  deduction?: number;
  borrowed?: number;
  paid: number;
  isPaid: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const SalarySchema = new Schema<Salary>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    month: { type: String, required: true }, // YYYY-MM
    baseSalary: { type: Number, required: true },
    bonus: { type: Number, default: 0 },
    deduction: { type: Number, default: 0 },
    borrowed: { type: Number, default: 0 }, // borrowed amount before payday
    paid: { type: Number, default: 0 },
    isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SalaryModel = mongoose.model<Salary>("Salary", SalarySchema);
export type { Salary };
