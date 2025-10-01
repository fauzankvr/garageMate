import mongoose, { Schema, Document } from "mongoose";

interface Warranty extends Document {
  packageName: string;
  duration: number; // Duration in months
  cost: number;
  allowedVisits: number;
  customerName: string;
  mobileNumber: string;
  carName: string;
  numberPlate: string;
  issuedDate: Date;
  lastDueDate: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const WarrantySchema = new Schema<Warranty>(
  {
    packageName: {
      type: String,
      required: [true, "Package name is required"],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 month"],
    },
    cost: {
      type: Number,
      required: [true, "Cost is required"],
      min: [0, "Cost cannot be negative"],
    },
    allowedVisits: {
      type: Number,
      required: [true, "Allowed visits is required"],
      min: [0, "Allowed visits cannot be negative"],
      default: 0,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^\+?\d{10,15}$/, "Please enter a valid mobile number"],
    },
    carName: {
      type: String,
      required: [true, "Car name is required"],
      trim: true,
    },
    numberPlate: {
      type: String,
      required: [true, "Number plate is required"],
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9-]+$/, "Please enter a valid number plate"],
    },
    issuedDate: {
      type: Date,
      required: [true, "Issued date is required"],
    },
    lastDueDate: {
      type: Date,
      required: [true, "Last due date is required"],
      validate: {
        validator: function (value: Date) {
          return value >= this.issuedDate;
        },
        message: "Last due date must be on or after issued date",
      },
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

export const WarrantyModel = mongoose.model<Warranty>("Warranty", WarrantySchema);
export type { Warranty };