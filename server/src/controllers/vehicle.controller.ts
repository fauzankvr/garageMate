import { Request, Response } from "express";
import vehicleService from "../services/vehicle.service";
import { Vehicle } from "../models/vehicle.model";

class VehicleController {
  // Create a new vehicle
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as Vehicle;
      const vehicle = await vehicleService.create(data);
      res.status(201).json({
        success: true,
        message: "Vehicle created successfully",
        data: vehicle,
      });
    } catch (error) {
      console.error("Error creating vehicle:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create vehicle",
      });
    }
  }

  // Get all vehicles
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.query;
      const vehicles = await vehicleService.findAll(customerId?.toString());
      res.status(200).json({
        success: true,
        data: vehicles,
      });
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch vehicles",
      });
    }
  }

  // Get vehicles by customer ID
  async getByCustomerId(req: Request, res: Response): Promise<void> {
    try {
      const { customerId } = req.params;
      if (!customerId) {
        res.status(400).json({
          success: false,
          message: "customerId is required",
        });
        return;
      }
      const vehicles = await vehicleService.findVehicleByCustomerId(customerId);
      res.status(200).json({
        success: true,
        data: vehicles,
      });
    } catch (error) {
      console.error("Error fetching vehicles by customer ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch vehicles for the given customer ID",
      });
    }
  }

  // Search vehicles
  async search(req: Request, res: Response): Promise<void> {
    try {
      const { model, registration_number } = req.query;
      if (model && typeof model !== "string") {
        res
          .status(400)
          .json({ success: false, message: "model must be a string" });
        return;
      }
      if (registration_number && typeof registration_number !== "string") {
        res
          .status(400)
          .json({
            success: false,
            message: "registration_number must be a string",
          });
        return;
      }

      const vehicles = await vehicleService.search({
        model: model as string | undefined,
        registration_number: registration_number as string | undefined,
      });
      res.status(200).json({ success: true, data: vehicles });
    } catch (error) {
      console.error("Error searching vehicles:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to search vehicles" });
    }
  }

  // 🔹 Update vehicle
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body as Partial<Vehicle>;

      const updatedVehicle = await vehicleService.update(id, data);
      if (!updatedVehicle) {
        res.status(404).json({ success: false, message: "Vehicle not found" });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Vehicle updated successfully",
        data: updatedVehicle,
      });
    } catch (error) {
      console.error("Error updating vehicle:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update vehicle" });
    }
  }

  // 🔹 Delete vehicle
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deleted = await vehicleService.delete(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: "Vehicle not found" });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Vehicle deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete vehicle" });
    }
  }
}

export default new VehicleController();
