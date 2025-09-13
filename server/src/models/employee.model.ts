import mongoose, { Schema, Document, Model } from "mongoose";

interface Employee extends Document {
  phone: string;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const EmployeeSchema = new Schema<Employee>(
  {
    phone: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const EmployeeModel = mongoose.model<Employee>(
  "Employee",
  EmployeeSchema
);
export type { Employee };
