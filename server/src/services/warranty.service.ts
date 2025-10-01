import mongoose, { Types } from "mongoose";
import { Warranty, WarrantyModel } from "../models/warranty.model";
import { Filter } from "./dashboard.service";

export class WarrantyService {
  async getAll(filter?: Filter): Promise<Warranty[]> {
    try {
      let query: any = {};

      // Filter by specific issued date
      if (filter?.date) {
        const targetDate = new Date(filter.date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(targetDate.getDate() + 1);

        query.issuedDate = {
          $gte: targetDate,
          $lt: nextDay,
        };
      }

      // Filter by year (based on issuedDate)
      if (filter?.year && !filter.month) {
        const startDate = new Date(`${filter.year}-01-01`);
        const endDate = new Date(`${filter.year}-12-31`);
        endDate.setHours(23, 59, 59, 999);

        query.issuedDate = {
          $gte: startDate,
          $lte: endDate,
        };
      }

      // Filter by month and year (based on issuedDate)
      if (filter?.month && filter?.year) {
        const startDate = new Date(`${filter.year}-${filter.month}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0); // Last day of the month
        endDate.setHours(23, 59, 59, 999);

        query.issuedDate = {
          $gte: startDate,
          $lte: endDate,
        };
      }

      return await WarrantyModel.find(query).exec();
    } catch (error) {
      throw new Error(
        `Failed to fetch warranties: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async getById(id: string): Promise<Warranty | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await WarrantyModel.findById(id).exec();
  }

  async getByCustomerId(customerId: string): Promise<Warranty[]> {
    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return [];
    }
    return await WarrantyModel.find({ customerId }).exec();
  }

  async create(
    warrantyData: Omit<Warranty, "_id" | "createdAt" | "updatedAt">
  ): Promise<Warranty> {
    const warranty = new WarrantyModel(warrantyData);
    return await warranty.save();
  }

  async update(
    id: string,
    warrantyData: Partial<Warranty>
  ): Promise<Warranty | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await WarrantyModel.findByIdAndUpdate(id, warrantyData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async delete(id: string): Promise<Warranty | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await WarrantyModel.findByIdAndDelete(id).exec();
  }
}

export default new WarrantyService();
