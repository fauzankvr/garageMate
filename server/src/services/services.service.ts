import { Model } from "mongoose";
import { Service, ServiceModel } from "../models/service.model";

class ServiceService {
  private serviceModel: Model<Service>;

  constructor() {
    this.serviceModel = ServiceModel;
  }

  async create(data: Service): Promise<Service> {
    try {
      const service = new this.serviceModel(data);
      return await service.save();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create service: ${errorMessage}`);
    }
  }

  async findAll(): Promise<Service[]> {
    try {
      return await this.serviceModel.find().exec();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch services: ${errorMessage}`);
    }
  }

  async findById(id: string): Promise<Service | null> {
    try {
      return await this.serviceModel.findById(id).exec();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch service: ${errorMessage}`);
    }
  }

  async update(id: string, data: Partial<Service>): Promise<Service | null> {
    try {
      return await this.serviceModel
        .findByIdAndUpdate(id, data, { new: true })
        .exec();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to update service: ${errorMessage}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.serviceModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to delete service: ${errorMessage}`);
    }
  }
}

export default new ServiceService();
