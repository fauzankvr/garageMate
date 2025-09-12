import mongoose, { Schema, Document, Model } from "mongoose";

interface Product extends Document {
  productName: string;
  description: string;
  price: number;
  // sku: string;
  // wa: string;
  brand: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<Product>(
  {
    productName: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    // sku: { type: String, required: true, unique: true },
    // category: { type: String, required: true },
    brand: { type: String, required: true },
  },
  { timestamps: true }
);

export const ProductModel = mongoose.model<Product>("Product", ProductSchema);
export type { Product };
