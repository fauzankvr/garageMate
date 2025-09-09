import productService from "../services/product.service";
import type { Response, Request } from "express"

class ProductController {
    async getAll(req: Request, res: Response) {
            const costumers = await productService.findAll()
            console.log(costumers);
            res.json(costumers)
        }
    
    async getById(req: Request, res: Response) {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Missing costumer id" });
        }
        const costumer = await productService.findById(id);
        if (!costumer) {
            return res.status(404).json({ message: "Costumer not found" });
        }
        res.json(costumer);
    }

    async create(req: Request, res: Response) {
        const newCostumer = await productService.create(req.body)
        res.status(201).json(newCostumer)
    }
    async update(req: Request, res: Response) {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Missing costumer id" });
        }
        const updatedCostumer = await productService.update(id, req.body);
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
        const deletedCostumer = await productService.delete(id);
        if (!deletedCostumer) {
            return res.status(404).json({ message: "Costumer not found" });
        }
        res.json(deletedCostumer);
    }
}

export default new ProductController