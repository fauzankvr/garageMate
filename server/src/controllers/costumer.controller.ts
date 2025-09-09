import costumerService from "../services/costumer.service";
import type { Response, Request } from "express"

class CostumerController {
  async getAll(req: Request, res: Response) {
   
    const costumers = await costumerService.findAll();
    res.json(costumers);
  }
  async getByPhone(req: Request, res: Response) {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }
    if (typeof phone !== "string") {
      return res.status(400).json({ message: "Phone number must be a string" });
    }
    const costumers = await costumerService.findByPhone(phone);
    res.json(costumers);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Missing costumer id" });
    }
    const costumer = await costumerService.findById(id);
    if (!costumer) {
      return res.status(404).json({ message: "Costumer not found" });
    }
    res.json(costumer);
  }

  async create(req: Request, res: Response) {
    const newCostumer = await costumerService.create(req.body);
    res.status(201).json(newCostumer);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Missing costumer id" });
    }
    const updatedCostumer = await costumerService.update(id, req.body);
    if (!updatedCostumer) {
      return res.status(404).json({ message: "Costumer not found" });
    }
    res.json(updatedCostumer);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Missing costumer id" });
    }
    const deleted = await costumerService.delete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Costumer not found" });
    }
    res.json({ message: "Costumer deleted successfully" });
  }
}

export default new CostumerController()