import mongoose, { Types } from "mongoose";
import { Salary, SalaryModel } from "../models/salary.model";
import { Filter } from "./dashboard.service";

export class SalaryService {
  async getAll(filter?: Filter): Promise<Salary[]> {
    try {
      let query: any = {};

      // Adjust field name based on your actual schema
      const dateField = "paymentDate"; // or "salaryDate", "createdAt", etc.

      if (filter?.date) {
        const targetDate = new Date(filter.date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(targetDate.getDate() + 1);

        query[dateField] = {
          $gte: targetDate,
          $lt: nextDay,
        };
      } else if (filter?.year) {
        if (filter.month) {
          const startDate = new Date(`${filter.year}-${filter.month}-01`);
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 1);

          query[dateField] = {
            $gte: startDate,
            $lt: endDate,
          };
        } else {
          const startDate = new Date(`${filter.year}-01-01`);
          const endDate = new Date(`${filter.year}-12-31`);
          endDate.setHours(23, 59, 59, 999);

          query[dateField] = {
            $gte: startDate,
            $lte: endDate,
          };
        }
      }

      return await SalaryModel.find(query)
        .populate("employee")
        .sort({ [dateField]: -1 })
        .exec();
    } catch (error) {
      throw new Error(
        `Failed to fetch salaries: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
  async getById(id: string): Promise<Salary | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await SalaryModel.findById(id).populate("employee").exec();
  }

  async getByEmployeeId(employeeId: string): Promise<Salary[]> {
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return [];
    }
    return await SalaryModel.find({ employee: employeeId })
      .populate("employee")
      .exec();
  }

  async create(
    salaryData: Omit<Salary, "_id" | "createdAt" | "updatedAt">
  ): Promise<Salary> {
    const salary = new SalaryModel(salaryData);
    return await salary.save();
  }

  async update(
    id: string,
    salaryData: Partial<Salary>
  ): Promise<Salary | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await SalaryModel.findByIdAndUpdate(id, salaryData, {
      new: true,
      runValidators: true,
    })
      .populate("employee")
      .exec();
  }

  async delete(id: string): Promise<Salary | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await SalaryModel.findByIdAndDelete(id).exec();
  }
}

export default new SalaryService();

