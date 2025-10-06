import mongoose, { Schema, Types, Document } from "mongoose";
import { Employee } from "./employee.model";

interface Salary extends Document {
  employee: Types.ObjectId | Employee; // Union type to handle both populated and unpopulated states
  date: Date; // Changed from month string to Date
  baseSalary: number;
  bonus?: number;
  deduction?: number;
  borrowed?: number;
  due: number; // Changed from paid to due
  // isPaid: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const SalarySchema = new Schema<Salary>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: Date, required: true }, // Changed to Date type
    baseSalary: { type: Number, required: true },
    bonus: { type: Number, default: 0 },
    deduction: { type: Number, default: 0 },
    borrowed: { type: Number, default: 0 }, // borrowed amount before payday
    due: {
      type: Number,
      required: true,
      default: function (this: Salary) {
        // Calculate due amount: baseSalary + bonus - deduction - borrowed
        return (
          (this.baseSalary || 0) +
          (this.bonus || 0) -
          (this.deduction || 0) -
          (this.borrowed || 0)
        );
      },
    },
    // isPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Update due amount before saving if relevant fields change
SalarySchema.pre("save", function (next) {
  this.due =
    (this.baseSalary || 0) +
    (this.bonus || 0) -
    (this.deduction || 0) -
    (this.borrowed || 0);
  next();
});

export const SalaryModel = mongoose.model<Salary>("Salary", SalarySchema);
export type { Salary };
