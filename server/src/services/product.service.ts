import { Model } from "mongoose";
import { Product, ProductModel } from "../models/product.model";

class ProductService {
  private productModel: Model<Product>;

  constructor() {
    this.productModel = ProductModel;
  }

  async findAll(): Promise<Product[]> {
    try {
      return await this.productModel.find().exec();
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
      console.log(data)
      const product = new this.productModel(data);
      return await product.save();
    } catch (error) {
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
