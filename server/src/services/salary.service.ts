import mongoose, { Types } from "mongoose";
import { Salary, SalaryModel } from "../models/salary.model";

export class SalaryService {
  async getAll(): Promise<Salary[]> {
    return await SalaryModel.find().populate("employee").exec();
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

