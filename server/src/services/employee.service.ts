import { Model } from "mongoose";
import { Employee, EmployeeModel } from "../models/employee.model";


class EmployeeService {
  private employeeModel: Model<Employee>;

  constructor() {
    this.employeeModel = EmployeeModel;
  }

  async create(data: Employee): Promise<Employee> {
    try {
      console.log(data)
      const employee = new this.employeeModel(data);
      return await employee.save();
    } catch (error) {
      console.log(error)
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create employee: ${errorMessage}`);
    }
  }

  async findAll(): Promise<Employee[]> {
    try {
      return await this.employeeModel.find().exec();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch employees: ${errorMessage}`);
    }
  }

  async findByPhone(phone: string): Promise<Employee[]> {
    try {
      return await this.employeeModel.find({ phone }).exec();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch employee by phone: ${errorMessage}`);
    }
  }

  async findById(id: string): Promise<Employee | null> {
    try {
      return await this.employeeModel.findById(id).exec();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch employee: ${errorMessage}`);
    }
  }

  async update(id: string, data: Partial<Employee>): Promise<Employee | null> {
    try {
      return await this.employeeModel
        .findByIdAndUpdate(id, data, { new: true })
        .exec();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update employee: ${errorMessage}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.employeeModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to delete employee: ${errorMessage}`);
    }
  }
}

export default new EmployeeService();
