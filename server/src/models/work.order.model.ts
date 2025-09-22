import mongoose, { Schema, Document, Model } from "mongoose";

interface ServiceCharge {
  description: string;
  price: number;
  for: string;
}

interface PaymentDetails {
  method: "cash" | "upi" | "both";
  cashAmount?: number; // Only used when method is "both"
  upiAmount?: number; // Only used when method is "both"
}

interface WorkOrder extends Document {
  customerId: mongoose.Types.ObjectId;
  vehicleId?: mongoose.Types.ObjectId; // Optional
  services: mongoose.Types.ObjectId[];
  products: mongoose.Types.ObjectId[];
  serviceCharges: ServiceCharge[];
  totalProductCost: number;
  totalServiceCharge: number;
  totalAmount: number;
  status: "pending" | "paid"; // Updated status options
  paymentDetails: PaymentDetails;
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
      enum: ["pending", "paid"],
      default: "pending",
    },
    paymentDetails: {
      method: {
        type: String,
        enum: ["cash", "upi", "both"],
        required: true,
      },
      cashAmount: {
        type: Number,
        required: function (this: PaymentDetails) {
          return this.method === "both";
        },
      },
      upiAmount: {
        type: Number,
        required: function (this: PaymentDetails) {
          return this.method === "both";
        },
      },
    },
  },
  { timestamps: true }
);

// Validation to ensure cashAmount + upiAmount = totalAmount when method is "both"
WorkOrderSchema.pre("validate", function (next) {
  if (this.paymentDetails.method === "both") {
    const totalPaid =
      (this.paymentDetails.cashAmount || 0) +
      (this.paymentDetails.upiAmount || 0);
    if (totalPaid !== this.totalAmount) {
      next(
        new Error(
          "Cash amount and UPI amount must sum to totalAmount when payment method is 'both'"
        )
      );
    }
  }
  next();
});

export const WorkOrderModel = mongoose.model<WorkOrder>(
  "WorkOrder",
  WorkOrderSchema
);
export type { WorkOrder, ServiceCharge, PaymentDetails };

