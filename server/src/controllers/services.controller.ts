import servicesService from "../services/services.service"
import type { Response, Request } from "express"

class ServiceController {
    async create(req: Request, res: Response) {
        console.log("req.body", req.body);
        const newCostumer = await servicesService.create(req.body)
        res.status(201).json(newCostumer)
    }

    async getAll(req: Request, res: Response) {
        const costumers = await servicesService.findAll()
        res.json(costumers)
    }
    
    async getById(req: Request, res: Response) {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Missing costumer id" });
        }
        const costumer = await servicesService.findById(id);
        if (!costumer) {
            return res.status(404).json({ message: "Costumer not found" });
        }
        res.json(costumer);
    }
    async update(req: Request, res: Response) {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Missing costumer id" });
        }
        const updatedCostumer = await servicesService.update(id, req.body);
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
        const deletedCostumer = await servicesService.delete(id);
        if (!deletedCostumer) {
            return res.status(404).json({ message: "Costumer not found" });
        }
        res.json(deletedCostumer);
    }
}

export default new ServiceController()