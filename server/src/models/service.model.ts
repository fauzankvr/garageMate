import mongoose, { Schema, Document, Model } from "mongoose";

interface Service extends Document {
  status: boolean;
  price: number;
  count: Number;
  serviceName: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ServiceSchema = new Schema<Service>(
  {
    status: { type: Boolean, required: true, default: true },
    price: { type: Number, required: true },
    count: { type: Number, required: true },
    serviceName: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

export const ServiceModel = mongoose.model<Service>("Service", ServiceSchema);
export type { Service };
