import { Request, Response } from "express";
import warrantyServiceInstance  from "../services/warranty.service";
import { Warranty } from "../models/warranty.model";
import { WarrantyService } from "../services/warranty.service";

class WarrantyController {
  constructor(private warrantyService: WarrantyService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const warranties = await this.warrantyService.getAll();
      res.status(200).json(warranties);
    } catch (error) {
      res.status(500).json({ message: "Error fetching warranties", error });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const warranty = await this.warrantyService.getById(req.params.id);
      if (!warranty) {
        res.status(404).json({ message: "Warranty not found" });
        return;
      }
      res.status(200).json(warranty);
    } catch (error) {
      res.status(500).json({ message: "Error fetching warranty", error });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const warrantyData: Omit<Warranty, "_id" | "createdAt" | "updatedAt"> =
        req.body;
      const newWarranty = await this.warrantyService.create(warrantyData);
      res.status(201).json(newWarranty);
    } catch (error) {
      res.status(500).json({ message: "Error creating warranty", error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const warrantyData: Partial<Warranty> = req.body;
      const updatedWarranty = await this.warrantyService.update(
        req.params.id,
        warrantyData
      );
      if (!updatedWarranty) {
        res.status(404).json({ message: "Warranty not found" });
        return;
      }
      res.status(200).json(updatedWarranty);
    } catch (error) {
      res.status(500).json({ message: "Error updating warranty", error });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const deletedWarranty = await this.warrantyService.delete(req.params.id);
      if (!deletedWarranty) {
        res.status(404).json({ message: "Warranty not found" });
        return;
      }
      res.status(200).json({ message: "Warranty deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting warranty", error });
    }
  }
}

export default new WarrantyController(warrantyServiceInstance);
