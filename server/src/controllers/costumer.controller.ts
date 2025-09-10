import { Request, Response } from "express";
import customerService from "../services/costumer.service";

// Define the Customer interface
interface Customer {
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

class CustomerController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const customers = await customerService.findAll();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching customers", error });
    }
  }

  async getByPhone(req: Request, res: Response): Promise<void> {
    const { phone } = req.query;
    if (!phone) {
      res.status(400).json({ message: "Phone number is required" });
      return;
    }
    if (typeof phone !== "string") {
      res.status(400).json({ message: "Phone number must be a string" });
      return;
    }
    try {
      const customers = await customerService.findByPhone(phone);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching customer by phone", error });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Missing customer ID" });
      return;
    }
    try {
      const customer = await customerService.findById(id);
      if (!customer) {
        res.status(404).json({ message: "Customer not found" });
        return;
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Error fetching customer", error });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const newCustomer = await customerService.create(req.body as Customer);
      res.status(201).json(newCustomer);
    } catch (error) {
      res.status(400).json({ message: "Error creating customer", error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Missing customer ID" });
      return 
    }
    try {
      const updatedCustomer = await customerService.update(id, req.body as Partial<Customer>);
      if (!updatedCustomer) {
         res.status(404).json({ message: "Customer not found" });
         return
      }
      res.json(updatedCustomer);
    } catch (error) {
      res.status(400).json({ message: "Error updating customer", error });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Missing customer ID" });
      return;
    }
    try {
      const deleted = await customerService.delete(id);
      if (!deleted) {
         res.status(404).json({ message: "Customer not found" });
         return;
      }
      res.json({ message: "Customer deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting customer", error });
    }
  }
}

export default new CustomerController();