import mongoose, { Types } from "mongoose";
import { Expense, ExpenseModel } from "../models/expense.model";
import { Filter } from "./dashboard.service";

export class ExpenseService {
  async getAll(filter?: Filter): Promise<Expense[]> {
    try {
      let query: any = {};

      // Filter by specific date
      if (filter?.date) {
        const targetDate = new Date(filter.date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(targetDate.getDate() + 1);

        query.date = {
          $gte: targetDate,
          $lt: nextDay,
        };
      }

      // Filter by year
      if (filter?.year && !filter.month) {
        const startDate = new Date(`${filter.year}-01-01`);
        const endDate = new Date(`${filter.year}-12-31`);
        endDate.setHours(23, 59, 59, 999);

        query.date = {
          $gte: startDate,
          $lte: endDate,
        };
      }

      // Filter by month and year
      if (filter?.month && filter?.year) {
        const startDate = new Date(`${filter.year}-${filter.month}-01`);
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0); // Last day of the month
        endDate.setHours(23, 59, 59, 999);

        query.date = {
          $gte: startDate,
          $lte: endDate,
        };
      }

      return await ExpenseModel.find(query).exec();
    } catch (error) {
      throw new Error(
        `Failed to fetch expenses: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async getById(id: string): Promise<Expense | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await ExpenseModel.findById(id).exec();
  }

  async getByEmployeeId(employeeId: string): Promise<Expense[]> {
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return [];
    }
    return await ExpenseModel.find({ employee: employeeId }).exec();
  }

  async create(
    expenseData: Omit<Expense, "_id" | "createdAt" | "updatedAt">
  ): Promise<Expense> {
    const expense = new ExpenseModel(expenseData);
    return await expense.save();
  }

  async update(
    id: string,
    expenseData: Partial<Expense>
  ): Promise<Expense | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await ExpenseModel.findByIdAndUpdate(id, expenseData, {
      new: true,
      runValidators: true,
    }).exec();
  }

  async delete(id: string): Promise<Expense | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await ExpenseModel.findByIdAndDelete(id).exec();
  }
}

export default new ExpenseService();
