import { Model } from "mongoose";
import { Customer, CustomerModel } from "../models/costumer.model";

class CustomerService {
  private customerModel: Model<Customer>;

  constructor() {
    this.customerModel = CustomerModel;
  }

  async create(data: Customer): Promise<Customer> {
    try {
      const customer = new this.customerModel(data);
      return await customer.save();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create customer: ${errorMessage}`);
    }
  }

  async findAll(): Promise<Customer[]> {
    try {
      return await this.customerModel.find().exec();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch customers: ${errorMessage}`);
    }
  }

  async findByPhone(phone: string): Promise<Customer[]> {
    try {
      return await this.customerModel.find({ phone }).exec();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch customer by phone: ${errorMessage}`);
    }
  }

  async findById(id: string): Promise<Customer | null> {
    try {
      return await this.customerModel.findById(id).exec();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch customer: ${errorMessage}`);
    }
  }

  async update(id: string, data: Partial<Customer>): Promise<Customer | null> {
    try {
      return await this.customerModel
        .findByIdAndUpdate(id, data, { new: true })
        .exec();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update customer: ${errorMessage}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.customerModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to delete customer: ${errorMessage}`);
    }
  }
}

export default new CustomerService();
