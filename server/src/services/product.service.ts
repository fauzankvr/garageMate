import { Model } from "mongoose";
import { Product, ProductModel } from "../models/product.model";
import { Filter } from "./dashboard.service";

class ProductService {
  private productModel: Model<Product>;

  constructor() {
    this.productModel = ProductModel;
  }

  async findAll(filter?: Filter): Promise<Product[]> {
    try {
      let query: any = {};

      // Date filtering using createdAt field
      if (filter?.date) {
        const targetDate = new Date(filter.date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(targetDate.getDate() + 1);
        query.createdAt = { $gte: targetDate, $lt: nextDay };
      } else if (filter?.year) {
        const startDate = filter.month
          ? new Date(`${filter.year}-${filter.month}-01`)
          : new Date(`${filter.year}-01-01`);

        const endDate = new Date(startDate);
        if (filter.month) {
          endDate.setMonth(endDate.getMonth() + 1);
          endDate.setDate(0); // Last day of month
        } else {
          endDate.setFullYear(endDate.getFullYear() + 1);
          endDate.setDate(0); // Last day of year
        }
        endDate.setHours(23, 59, 59, 999);

        query.createdAt = { $gte: startDate, $lte: endDate };
      }

      return await this.productModel
        .find(query)
        .sort({ createdAt: -1 }) // Newest first
        .exec();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch products: ${error.message}`);
      } else {
        throw new Error(`Failed to fetch products: ${String(error)}`);
      }
    }
  }

  async findById(id: string): Promise<Product | null> {
    try {
      return await this.productModel.findById(id).exec();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch product: ${error.message}`);
      } else {
        throw new Error(`Failed to fetch product: ${String(error)}`);
      }
    }
  }

  async create(data: Product): Promise<Product> {
    try {
      console.log(data);
      const product = new this.productModel(data);
      return await product.save();
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        throw new Error(`Failed to create product: ${error.message}`);
      } else {
        throw new Error(`Failed to create product: ${String(error)}`);
      }
    }
  }

  async update(id: string, data: Partial<Product>): Promise<Product | null> {
    try {
      return await this.productModel
        .findByIdAndUpdate(id, data, { new: true })
        .exec();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update product: ${error.message}`);
      } else {
        throw new Error(`Failed to update product: ${String(error)}`);
      }
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.productModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete product: ${error.message}`);
      } else {
        throw new Error(`Failed to delete product: ${String(error)}`);
      }
    }
  }
}

export default new ProductService();
