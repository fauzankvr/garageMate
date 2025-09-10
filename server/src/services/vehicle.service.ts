import { Model } from "mongoose";
import { Vehicle, VehicleModel } from "../models/vehicle.model";

interface SearchQuery {
  model?: string;
  registration_number?: string;
}

class VehicleService {
  private vehicleModel: Model<Vehicle>;

  constructor() {
    this.vehicleModel = VehicleModel;
  }

  async create(data: Vehicle): Promise<Vehicle> {
    try {
      const vehicle = new this.vehicleModel(data);
      return await vehicle.save();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create vehicle: ${errorMessage}`);
    }
  }

  async findAll(customerId: string): Promise<Vehicle[]> {
    try {
      return await this.vehicleModel.find({ customerId }).exec();
    } catch (error) {
      throw new Error(`Failed to fetch vehicles: ${error}`);
    }
  }

  async findById(id: string): Promise<Vehicle | null> {
    try {
      return await this.vehicleModel.findById(id).exec();
    } catch (error) {
      throw new Error(`Failed to fetch vehicle: ${error}`);
    }
  }

  async findVehicleByCustomerId(customerId: string): Promise<Vehicle[]> {
    try {
      return await this.vehicleModel.find({ customerId }).exec();
    } catch (error) {
      throw new Error(
        `Failed to fetch vehicles by customer ID: ${error}`
      );
    }
  }

  async search(query: SearchQuery): Promise<Vehicle[]> {
    try {
      const filter: any = {};
      if (query.model) {
        filter.model = { $regex: query.model, $options: "i" };
      }
      if (query.registration_number) {
        filter.registration_number = {
          $regex: query.registration_number,
          $options: "i",
        };
      }
      return await this.vehicleModel.find(filter).exec();
    } catch (error) {
      throw new Error(`Failed to search vehicles: ${error}`);
    }
  }

  async update(id: string, data: Partial<Vehicle>): Promise<Vehicle | null> {
    try {
      return await this.vehicleModel
        .findByIdAndUpdate(id, data, { new: true })
        .exec();
    } catch (error) {
      throw new Error(`Failed to update vehicle: ${error}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.vehicleModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      throw new Error(`Failed to delete vehicle: ${error}`);
    }
  }
}

export default new VehicleService();
