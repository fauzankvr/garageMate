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
interface LoginRequestBody {
  password: string;
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
    const { phone } = req.params;
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
      const newCustomer = await customerService.create(req.body);
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
  async verify(req: Request<{}, {}, LoginRequestBody>, res: Response): Promise<void> {
   const { password } = req.body;
    const VALID_PASSWORD = process.env.ADMIN_PASSWORD || "shahul@123";

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    if (password === VALID_PASSWORD) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }
  }
}

export default new CustomerController();