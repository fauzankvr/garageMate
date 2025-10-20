import mongoose, { Document, Schema, Types } from "mongoose";

// Define referenced interfaces (unchanged)
interface Customer {
  _id: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Vehicle {
  _id: Types.ObjectId;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Product {
  _id: Types.ObjectId;
  name: string;
  price: number;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Service {
  _id?: Types.ObjectId;
  isOffer?: boolean;
  warranty?: string;
  status?: boolean;
  price?: number;
  count?: number;
  serviceName?: string;
  description?: string;
}

interface ProductItem {
  productId: Types.ObjectId | Product;
  quantity?: number;
}

interface PaymentDetails {
  method: "cash" | "upi" | "both";
  cashAmount?: number;
  upiAmount?: number;
}

interface ServiceCharge {
  description?: string;
  price?: number;
  for?: string;
}

interface WorkOrder extends Document {
  serialNumber?: string;
  customerId: Types.ObjectId | Customer; // Kept required for logical consistency
  vehicleId?: Types.ObjectId | Vehicle;
  services?: Service[];
  products?: ProductItem[];
  serviceCharges?: ServiceCharge[];
  totalProductCost?: number;
  totalServiceCharge?: number;
  totalAmount?: number;
  status?: "pending" | "paid";
  paymentDetails?: PaymentDetails;
  notes?: string;
  discount?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const WorkOrderSchema = new Schema<WorkOrder>(
  {
    serialNumber: { type: String, unique: true }, // Removed required, kept unique
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true, // Kept required as it's critical for a work order
    },
    vehicleId: { type: Schema.Types.ObjectId, ref: "Vehicle" },
    services: [
      {
        _id: { type: Schema.Types.ObjectId, auto: true }, 
        isOffer: { type: Boolean }, 
        warranty: { type: String },
        status: { type: Boolean, default: true },
        price: { type: Number },
        count: { type: Number },
        serviceName: { type: String },
        description: { type: String },
      },
    ],
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, min: 1 },
      },
    ],
    serviceCharges: [
      {
        description: { type: String },
        price: { type: Number },
        for: { type: String },
      },
    ],
    totalProductCost: { type: Number },
    totalServiceCharge: { type: Number },
    totalAmount: { type: Number },
    status: { type: String, enum: ["pending", "paid"], default: "pending" },
    paymentDetails: {
      method: { type: String, enum: ["cash", "upi", "both"] },
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
    notes: { type: String }, // Already present, kept optional
    discount: { type: String }, // Added discount field, optional
  },
  { timestamps: true }
);

WorkOrderSchema.pre("validate", function (next) {
  if (this.paymentDetails?.method === "both") {
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
export type {
  WorkOrder,
  Service,
  ProductItem,
  PaymentDetails,
  ServiceCharge,
  Customer,
  Vehicle,
  Product,
};
