import { Request, Response } from "express";
import workOrderService from "../services/work.order.service";
import { WorkOrder } from "../models/work.order.model";
import vehicleService from "../services/vehicle.service";
import productService from "../services/product.service";
import serviceService from "../services/services.service";

class WorkOrderController {
  // Create a new work order
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as WorkOrder;

      if (data.vehicleId) {
        const vehicle = await vehicleService.findById(
          data.vehicleId.toString()
        );

        if (
          data.services &&
          Array.isArray(data.services) &&
          data.services.length > 0
        ) {
          for (const service of data.services) {
            // Handle different service data structures
            let serviceId: string | null = null;

            if (typeof service === "string") {
              // If service is already a string ID
              serviceId = service;
            } else if (service && typeof service === "object" && service._id) {
              // If service is an object with _id property
              serviceId = service._id.toString();
            } else if (service && typeof service === "object" && service._id) {
              // If service has a serviceId property
              serviceId = service._id.toString();
            } else {
              console.warn("Invalid service format:", service);
              continue; // Skip invalid service
            }

            // Check if we successfully extracted a serviceId
            if (!serviceId) {
              console.warn("Could not extract service ID:", service);
              continue;
            }

            const serviceData = await serviceService.findById(serviceId);
            if (serviceData?.isOffer) {
              if (!vehicle || !vehicle._id) {
                throw new Error("Vehicle not found");
              }

              const vehicleId = vehicle._id.toString();
              await vehicleService.update(vehicleId, {
                serviceCount: (vehicle.serviceCount || 0) + 1,
              });
            }
          }
        }
      }

      // Handle products stock update
      if (Array.isArray(data.products) && data.products.length > 0) {
        for (const productItem of data.products) {
          if (productItem?.productId) {
            let productId: string | null = null;

            if (typeof productItem.productId === "string") {
              productId = productItem.productId;
            } else if (
              typeof productItem.productId === "object" &&
              productItem.productId._id
            ) {
              productId = productItem.productId._id.toString();
            } else {
              console.warn("Invalid productId format:", productItem.productId);
              continue; // Skip invalid product
            }

            // Check if we successfully extracted a productId
            if (!productId) {
              console.warn(
                "Could not extract product ID:",
                productItem.productId
              );
              continue;
            }

            const product = await productService.findById(productId);
            if (!product || !product._id) {
              throw new Error(`Product not found: ${productId}`);
            }

            const newStock =
              Number(product.stock || 0) - Number(productItem.quantity || 0);

            if (newStock < 0) {
              throw new Error(`Insufficient stock for product ${productId}`);
            }

            await productService.update(productId, { stock: newStock });
          }
        }
      }

      const workOrder = await workOrderService.create(data);
      res.status(201).json({
        success: true,
        message: "Work order created successfully",
        data: workOrder,
      });
    } catch (error: any) {
      console.error("Error creating work order:", error);

      // More specific error handling
      if (error.message.includes("Cast to ObjectId failed")) {
        res.status(400).json({
          success: false,
          message: "Invalid service or product ID format",
        });
      } else if (error.message.includes("Product not found")) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else if (error.message.includes("Vehicle not found")) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: error.message || "Failed to create work order",
        });
      }
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

  async getByVehicleId(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id
      const workOrders = await workOrderService.findByVehicleId(id);
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
}

export default new WorkOrderController();
