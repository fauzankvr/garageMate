import mongoose, { Schema, Document, Model } from "mongoose";

interface ServiceCharge {
  description: string;
  price: number;
  for: string;
}

interface WorkOrder extends Document {
  customerId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  services: mongoose.Types.ObjectId[];
  products: mongoose.Types.ObjectId[];
  serviceCharges: ServiceCharge[];
  totalProductCost: number;
  totalServiceCharge: number;
  totalAmount: number;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}

const WorkOrderSchema = new Schema<WorkOrder>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    services: [{ type: Schema.Types.ObjectId, ref: "Service", required: true }],
    products: [{ type: Schema.Types.ObjectId, ref: "Product", required: true }],
    serviceCharges: [
      {
        description: { type: String, required: true },
        price: { type: Number, required: true },
        for: { type: String, required: true },
      },
    ],
    totalProductCost: { type: Number, required: true },
    totalServiceCharge: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const WorkOrderModel = mongoose.model<WorkOrder>(
  "WorkOrder",
  WorkOrderSchema
);
export type { WorkOrder, ServiceCharge };
