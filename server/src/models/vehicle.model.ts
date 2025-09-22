import mongoose, { Schema, Document, Model } from "mongoose";

export interface Vehicle {
  _id?: string;
  model: string;
  year: string;
  brand: string;
  registration_number: string;
  customerId: mongoose.Types.ObjectId;
  serviceCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const VehicleSchema = new Schema<Vehicle>(
  {
    model: { type: String, required: true },
    year: { type: String, required: true },
    brand: { type: String, required: true },
    serviceCount: { type: Number, default: 0 },
    registration_number: { type: String, required: true, unique: true },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
  },
  { timestamps: true }
);

export const VehicleModel = mongoose.model<Vehicle>("Vehicle", VehicleSchema);
