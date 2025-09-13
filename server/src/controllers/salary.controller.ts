import { Request, Response } from "express";
import { SalaryService } from "../services/salary.service"; // Import the class
import salaryServiceInstance from "../services/salary.service"; // Import the instance
import { Salary } from "../models/salary.model";

class SalaryController {
  constructor(private salaryService: SalaryService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const salaries = await this.salaryService.getAll();
      res.status(200).json(salaries);
    } catch (error) {
      res.status(500).json({ message: "Error fetching salaries", error });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const salary = await this.salaryService.getById(req.params.id);
      if (!salary) {
        res.status(404).json({ message: "Salary not found" });
        return;
      }
      res.status(200).json(salary);
    } catch (error) {
      res.status(500).json({ message: "Error fetching salary", error });
    }
  }

  async getByEmployeeId(req: Request, res: Response): Promise<void> {
    try {
      const salaries = await this.salaryService.getByEmployeeId(
        req.params.employeeId
      );
      res.status(200).json(salaries);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching employee salaries", error });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const salaryData: Omit<Salary, "_id" | "createdAt" | "updatedAt"> =
        req.body;
      const newSalary = await this.salaryService.create(salaryData);
      res.status(201).json(newSalary);
    } catch (error) {
      res.status(500).json({ message: "Error creating salary", error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const salaryData: Partial<Salary> = req.body;
      const updatedSalary = await this.salaryService.update(
        req.params.id,
        salaryData
      );
      if (!updatedSalary) {
        res.status(404).json({ message: "Salary not found" });
        return;
      }
      res.status(200).json(updatedSalary);
    } catch (error) {
      res.status(500).json({ message: "Error updating salary", error });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const deletedSalary = await this.salaryService.delete(req.params.id);
      if (!deletedSalary) {
        res.status(404).json({ message: "Salary not found" });
        return;
      }
      res.status(200).json({ message: "Salary deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting salary", error });
    }
  }
}

export default new SalaryController(salaryServiceInstance);

