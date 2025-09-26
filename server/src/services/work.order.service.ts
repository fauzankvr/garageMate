import { Model, Types } from "mongoose";
import { WorkOrder, WorkOrderModel } from "../models/work.order.model";

class WorkOrderService {
  private workOrderModel: Model<WorkOrder>;

  constructor() {
    this.workOrderModel = WorkOrderModel;
  }

  async create(data: any): Promise<WorkOrder> {
    try {
      console.log("daa...", data);

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

      const workOrder = new this.workOrderModel(sanitizedData);
      console.log(workOrder);

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

  async findAll(): Promise<WorkOrder[]> {
    try {
      return await this.workOrderModel
        .find()
        .populate("customerId")
        .populate("vehicleId")
        .populate("products.productId")
        // Remove .populate("services") since services are embedded
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
