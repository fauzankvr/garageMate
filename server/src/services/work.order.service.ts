import { Model, Types } from "mongoose";
import { WorkOrder, WorkOrderModel } from "../models/work.order.model";
import { Filter } from "./dashboard.service";
import { CounterModel } from "../models/counter.model";

class WorkOrderService {
  private workOrderModel: Model<WorkOrder>;

  constructor() {
    this.workOrderModel = WorkOrderModel;
  }

  private async getNextSequence(counterId: string): Promise<number> {
    try {
      const counter = await CounterModel.findOneAndUpdate(
        { _id: counterId },
        { $inc: { sequence_value: 1 } }, // Atomically increment the sequence
        {
          new: true, // Return the updated document
          upsert: true, // Create the counter if it doesn't exist
        }
      );
      return counter.sequence_value;
    } catch (error) {
      throw new Error(`Failed to get next sequence: ${error}`);
    }
  }

  async create(data: any): Promise<WorkOrder> {
    try {
      // Remove temporary IDs from services (IDs that start with 'temp-')
      const sanitizedData = {
        ...data,
        services: data.services.map((service: any) => {
          if (service._id && service._id.startsWith("temp-")) {
            const { _id, ...serviceWithoutId } = service;
            return serviceWithoutId;
          }
          return service;
        }),
      };

      // Generate the serial number
      const sequence = await this.getNextSequence("work_order_sequence");
      const serialNumber = `INV-${sequence.toString().padStart(3, "0")}`; // e.g., WO001

      // Add serialNumber to the data
      const workOrderData = {
        ...sanitizedData,
        serialNumber,
      };

      const workOrder = new this.workOrderModel(workOrderData);

      const savedWorkOrder = await workOrder.save();

      // Populate only the reference fields, not services (since they're embedded)
      return await savedWorkOrder.populate([
        "customerId",
        "vehicleId",
        "products.productId",
      ]);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create work order: ${error.message}`);
      } else {
        throw new Error(`Failed to create work order: ${String(error)}`);
      }
    }
  }

  async findAll(filter?: Filter): Promise<WorkOrder[]> {
    try {
      let query: any = {};

      // Filter by specific date (using createdAt field)
      if (filter?.date) {
        const targetDate = new Date(filter.date);
        const nextDay = new Date(targetDate);
        nextDay.setDate(targetDate.getDate() + 1);

        query.createdAt = {
          $gte: targetDate,
          $lt: nextDay,
        };
      }

      // Filter by year only
      if (filter?.year && !filter.month) {
        const startDate = new Date(`${filter.year}-01-01`);
        const endDate = new Date(`${filter.year}-12-31`);
        endDate.setHours(23, 59, 59, 999);

        query.createdAt = {
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

        query.createdAt = {
          $gte: startDate,
          $lte: endDate,
        };
      }

      return await this.workOrderModel
        .find(query)
        .populate("customerId")
        .populate("vehicleId")
        .populate("products.productId")
        .sort({ createdAt: -1 }) // Sort by latest first
        .exec();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch work orders: ${error.message}`);
      } else {
        throw new Error(`Failed to fetch work orders: ${String(error)}`);
      }
    }
  }

  async findById(id: string): Promise<WorkOrder | null> {
    try {
      return await this.workOrderModel
        .findById(id)
        .populate("customerId")
        .populate("vehicleId")
        .populate("products.productId")
        // Remove .populate("services") since services are embedded
        .exec();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch work order: ${error.message}`);
      } else {
        throw new Error(`Failed to fetch work order: ${String(error)}`);
      }
    }
  }

  async update(
    id: string,
    data: Partial<WorkOrder>
  ): Promise<WorkOrder | null> {
    try {
      // Remove temporary IDs from services if they exist in the update data
      const sanitizedData = { ...data };
      if (data.services) {
        sanitizedData.services = data.services.map((service: any) => {
          if (service._id && service._id.startsWith("temp-")) {
            const { _id, ...serviceWithoutId } = service;
            return serviceWithoutId;
          }
          return service;
        });
      }

      return await this.workOrderModel
        .findByIdAndUpdate(id, sanitizedData, { new: true })
        .populate("customerId")
        .populate("vehicleId")
        .populate("products.productId")
        // Remove .populate("services") since services are embedded
        .exec();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update work order: ${error.message}`);
      } else {
        throw new Error(`Failed to update work order: ${String(error)}`);
      }
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.workOrderModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete work order: ${error.message}`);
      } else {
        throw new Error(`Failed to delete work order: ${String(error)}`);
      }
    }
  }
}

export default new WorkOrderService();
