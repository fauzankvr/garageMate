import mongoose, { Schema, Document, Model } from "mongoose";

export interface Vehicle {
  model: string;
  year: number;
  brand: string;
  registration_number: string;
  customerId: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const VehicleSchema = new Schema<Vehicle>(
  {
    model: { type: String, required: true },
    year: { type: Number, required: true },
    brand: { type: String, required: true },
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
