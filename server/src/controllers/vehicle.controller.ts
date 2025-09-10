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
      if (!customerId || typeof customerId !== "string") {
         res.status(400).json({
          success: false,
          message: "customerId must be a string",
         });
        return;
      }
      const vehicles = await vehicleService.findAll(customerId);
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

  // Search vehicles by model and/or registration number
  async search(req: Request, res: Response): Promise<void> {
    try {
      const { model, registration_number } = req.query;
      if (model && typeof model !== "string") {
         res.status(400).json({
          success: false,
          message: "model must be a string",
         });
        return;
      }
      if (registration_number && typeof registration_number !== "string") {
         res.status(400).json({
          success: false,
          message: "registration_number must be a string",
         });
        return;
      }
      const vehicles = await vehicleService.search({
        model: model as string | undefined,
        registration_number: registration_number as string | undefined,
      });
      res.status(200).json({
        success: true,
        data: vehicles,
      });
    } catch (error) {
      console.error("Error searching vehicles:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search vehicles",
      });
    }
  }
}

export default new VehicleController();
