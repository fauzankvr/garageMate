import { Request, Response } from "express";
import employeeService from "../services/employee.service";

// Define the Employee interface
interface Employee {
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

class EmployeeController {
  async getAll(req: Request, res: Response): Promise<void> {
      try {
        console.log("req.body", req.body);
      const employees = await employeeService.findAll();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Error fetching employees", error });
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
      const employees = await employeeService.findByPhone(phone);
      res.json(employees);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching employee by phone", error });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Missing employee ID" });
      return;
    }
    try {
      const employee = await employeeService.findById(id);
      if (!employee) {
        res.status(404).json({ message: "Employee not found" });
        return;
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Error fetching employee", error });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const newEmployee = await employeeService.create(req.body);
      res.status(201).json(newEmployee);
    } catch (error) {
      res.status(400).json({ message: "Error creating employee", error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Missing employee ID" });
      return;
    }
    try {
      const updatedEmployee = await employeeService.update(
        id,
        req.body as Partial<Employee>
      );
      if (!updatedEmployee) {
        res.status(404).json({ message: "Employee not found" });
        return;
      }
      res.json(updatedEmployee);
    } catch (error) {
      res.status(400).json({ message: "Error updating employee", error });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Missing employee ID" });
      return;
    }
    try {
      const deleted = await employeeService.delete(id);
      if (!deleted) {
        res.status(404).json({ message: "Employee not found" });
        return;
      }
      res.json({ message: "Employee deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting employee", error });
    }
  }
}

export default new EmployeeController();
