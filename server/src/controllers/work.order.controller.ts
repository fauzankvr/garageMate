import { Request, Response } from "express";
import workOrderService from "../services/work.order.service";
import { WorkOrder } from "../models/work.order.model";
import vehicleService from "../services/vehicle.service";
import productService from "../services/product.service";

class WorkOrderController {
  // Create a new work order
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as WorkOrder;

      if (data.vehicleId) {
        const vehicle = await vehicleService.findById(
          data.vehicleId.toString()
        );
        if (!vehicle || !vehicle._id) throw new Error("Vehicle not found");
        const vehicleId = vehicle._id; // Renamed variable
        if (vehicleId) {
          await vehicleService.update(vehicleId, {
            serviceCount: vehicle.serviceCount + 1,
          });
        }
      }
if (Array.isArray(data.products) && data.products.length > 0) {
  for (const productItem of data.products) {
    if (productItem?.productId) {
      const productId = productItem.productId.toString();
      const product = await productService.findById(productId);

      if (!product || !product._id) throw new Error("Product not found");

      const productDbId = product._id.toString();
      const newStock = Number(product.stock) - Number(productItem.quantity);

      await productService.update(productDbId, { stock: newStock });
    }
  }
}
    

      const workOrder = await workOrderService.create(data);
      res.status(201).json({
        success: true,
        message: "Work order created successfully",
        data: workOrder,
      });
    } catch (error) {
      console.error("Error creating work order:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create work order",
      });
    }
  }

  // Get all work orders
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const workOrders = await workOrderService.findAll();
      res.status(200).json({
        success: true,
        data: workOrders,
      });
    } catch (error) {
      console.error("Error fetching work orders:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch work orders",
      });
    }
  }

  // Get work order by ID
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Missing work order ID",
        });
        return;
      }
      const workOrder = await workOrderService.findById(id);
      if (!workOrder) {
        res.status(404).json({
          success: false,
          message: "Work order not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: workOrder,
      });
    } catch (error) {
      console.error("Error fetching work order:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch work order",
      });
    }
  }

  // Update a work order
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Missing work order ID",
        });
        return;
      }
      const updatedWorkOrder = await workOrderService.update(
        id,
        req.body as Partial<WorkOrder>
      );
      if (!updatedWorkOrder) {
        res.status(404).json({
          success: false,
          message: "Work order not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Work order updated successfully",
        data: updatedWorkOrder,
      });
    } catch (error) {
      console.error("Error updating work order:", error);
      res.status(400).json({
        success: false,
        message: "Failed to update work order",
      });
    }
  }

  // Delete a work order
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Missing work order ID",
        });
      }
      const deleted = await workOrderService.delete(id);
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Work order not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Work order deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting work order:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete work order",
      });
    }
  }
}

export default new WorkOrderController();
