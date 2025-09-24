import mongoose, { Schema, Document, Model } from "mongoose";

interface Service {
  warranty: string;
  status: boolean;
  price: number;
  count: number;
  serviceName: string;
  description: string;
}

interface ProductItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}

interface PaymentDetails {
  method: "cash" | "upi" | "both";
  cashAmount?: number;
  upiAmount?: number;
}

interface ServiceCharge {
  description: string;
  price: number;
  for: string; // e.g., "labor", "tax", "additional fee"
}

interface WorkOrder extends Document {
  customerId: mongoose.Types.ObjectId;
  vehicleId?: mongoose.Types.ObjectId;
  services: Service[];
  products: ProductItem[];
  serviceCharges: ServiceCharge[];
  totalProductCost: number;
  totalServiceCharge: number;
  totalAmount: number;
  status: "pending" | "paid";
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
    services: [
      {
        warranty: { type: String, required: true },
        status: { type: Boolean, required: true, default: true },
        price: { type: Number, required: true },
        count: { type: Number, required: true },
        serviceName: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
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
export type { WorkOrder, Service, ProductItem, PaymentDetails, ServiceCharge };
