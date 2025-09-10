import { Request, Response } from "express";
import productService from "../services/product.service";

// Define the Product interface
interface Product {
  _id?: string;
  productName: string;
  description: string;
  price: number;
  sku: string;
  category: string;
  brand: string;
}

class ProductController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const products = await productService.findAll();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products", error });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ message: "Missing product ID" });
        return;
    }
    try {
      const product = await productService.findById(id);
      if (!product) {
          res.status(404).json({ message: "Product not found" });
          return;
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product", error });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const newProduct = await productService.create(req.body as Product);
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(400).json({ message: "Error creating product", error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ message: "Missing product ID" });
        return;
    }
    try {
      const updatedProduct = await productService.update(
        id,
        req.body as Partial<Product>
      );
      if (!updatedProduct) {
          res.status(404).json({ message: "Product not found" });
          return;
      }
      res.json(updatedProduct);
    } catch (error) {
      res.status(400).json({ message: "Error updating product", error });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ message: "Missing product ID" });
        return;
    }
    try {
      const deleted = await productService.delete(id);
      if (!deleted) {
          res.status(404).json({ message: "Product not found" });
          return;
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting product", error });
    }
  }
}

export default new ProductController();
