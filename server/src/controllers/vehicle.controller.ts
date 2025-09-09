import vehicleService from "../services/vehicle.service";
import type { Request, Response } from "express";

class VehicleController {
  // Create a new vehicle
  async create(req: Request, res: Response) {
    try {
      const data = req.body;
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
  async getAll(req: Request, res: Response) {
    try {
      const { costomerId } = req.query;
      console.log("costomerId:", costomerId);
      console.log(req.query)
      if( !costomerId || typeof costomerId !== 'string') {
        return res.status(400).json({ message: "costomerId must be a string" });
      }
      const vehicles = await vehicleService.findAll(costomerId);

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

  async getBycostumerId(req: Request, res: Response) {
    try {
        const { costumerId } = req.params;

        if (!costumerId) {
        return res.status(400).json({
            success: false,
            message: "costumerId is required",
        });
        }

        const vehicles = await vehicleService.findVehicleBycostumerId(costumerId);

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
  async search(req: Request, res: Response) {
    try {
      const { model, registration_number } = req.query;

      const vehicles = await vehicleService.search({
        model: model as string,
        registration_number: registration_number as string,
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
