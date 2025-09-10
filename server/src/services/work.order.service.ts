import { Model } from "mongoose";
import { WorkOrder, WorkOrderModel } from "../models/work.order.model";

class WorkOrderService {
  private workOrderModel: Model<WorkOrder>;

  constructor() {
    this.workOrderModel = WorkOrderModel;
  }

  async create(data: WorkOrder): Promise<WorkOrder> {
    try {
      const workOrder = new this.workOrderModel(data);
      return await workOrder.save();
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
        .populate("customerId") // Changed from costumerId
        .populate("vehicleId")
        .populate("products")
        .populate("services")
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
        .populate("products")
        .populate("services")
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
      return await this.workOrderModel
        .findByIdAndUpdate(id, data, { new: true })
        .populate("customerId")
        .populate("vehicleId")
        .populate("products")
        .populate("services")
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
