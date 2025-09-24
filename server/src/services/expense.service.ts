import mongoose, { Types } from "mongoose";
import { Expense, ExpenseModel } from "../models/expense.model";

export class ExpenseService {
  async getAll(): Promise<Expense[]> {
    return await ExpenseModel.find().exec();
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
    return await ExpenseModel.find({ employee: employeeId })
      .exec();
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
    })
      .exec();
  }

  async delete(id: string): Promise<Expense | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await ExpenseModel.findByIdAndDelete(id).exec();
  }
}

export default new ExpenseService();
