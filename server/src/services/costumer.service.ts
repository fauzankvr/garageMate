import { Model } from "mongoose";
import { Customer, CustomerModel } from "../models/costumer.model";

class CustomerService {
  private customerModel: Model<Customer>;

  constructor() {
    this.customerModel = CustomerModel;
  }

  async create(data: Customer): Promise<Customer> {
    try {
      const Oldcustomer = await this.customerModel.findOne({ phone: data.phone });
      if (Oldcustomer) {
        throw new Error("Customer already exists");
      }
      const customer = new this.customerModel(data);
      return await customer.save();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`${errorMessage}`);
    }
  }

  async findAll(): Promise<Customer[]> {
    try {
      return await this.customerModel.find().exec();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch customers: ${errorMessage}`);
    }
  }

  async findByPhone(phone: string): Promise<Customer[]> {
    try {
      // Trim and convert phone to string
      phone = phone.trim().toString();
      console.log(phone);
      // Create regex to match the first 5 or 6 digits of the phone number
      const firstFiveDigits = phone.slice(0, 5);
      const firstSixDigits = phone.slice(0, 6);
      const regexPattern = `^(${firstFiveDigits}|${firstSixDigits})`;

      // Use regex to find customers with matching phone numbers
      return await this.customerModel
        .find({ phone: { $regex: regexPattern, $options: "i" } })
        .exec();
    } catch (error) {
      throw new Error(`Failed to find customers by phone: ${error}`);
    }
  }

  async findById(id: string): Promise<Customer | null> {
    try {
      return await this.customerModel.findById(id).exec();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch customer: ${errorMessage}`);
    }
  }

  async update(id: string, data: Partial<Customer>): Promise<Customer | null> {
    try {
      return await this.customerModel
        .findByIdAndUpdate(id, data, { new: true })
        .exec();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update customer: ${errorMessage}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.customerModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to delete customer: ${errorMessage}`);
    }
  }
}

export default new CustomerService();
