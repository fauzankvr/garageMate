import { Request, Response } from "express";
import servicesService from "../services/services.service";

// Define the Service interface
interface Service {
  _id?: string;
  name: string;
  description?: string;
  price: number;
}

class ServiceController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      console.log("req.body", req.body);
      const newService = await servicesService.create(req.body);
      res.status(201).json(newService);
    } catch (error) {
      res.status(400).json({ message: "Error creating service", error });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const services = await servicesService.findAll();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Error fetching services", error });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ message: "Missing service ID" });
        return;
    }
    try {
      const service = await servicesService.findById(id);
      if (!service) {
          res.status(404).json({ message: "Service not found" });
          return;
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Error fetching service", error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ message: "Missing service ID" });
        return;
    }
    try {
      const updatedService = await servicesService.update(
        id,
        req.body as Partial<Service>
      );
      if (!updatedService) {
          res.status(404).json({ message: "Service not found" });
          return;
      }
      res.json(updatedService);
    } catch (error) {
      res.status(400).json({ message: "Error updating service", error });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ message: "Missing service ID" });
        return;
    }
    try {
      const deleted = await servicesService.delete(id);
      if (!deleted) {
          res.status(404).json({ message: "Service not found" });
          return;
      }
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting service", error });
    }
  }
}

export default new ServiceController();
