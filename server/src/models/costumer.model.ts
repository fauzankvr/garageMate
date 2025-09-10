import mongoose, { Schema, Document, Model } from "mongoose";

interface Customer extends Document {
  phone: string;
  name: string;
  email: string;
  vehicles: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const CustomerSchema = new Schema<Customer>(
  {
    phone: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    vehicles: [{ type: Schema.Types.ObjectId, ref: "Vehicle" }],
  },
  { timestamps: true }
);

export const CustomerModel = mongoose.model<Customer>(
  "Customer",
  CustomerSchema
);
export type { Customer };
