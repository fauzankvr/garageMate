import { Request, Response } from "express";
import { ExpenseService } from "../services/expense.service";
import expenseServiceInstance from "../services/expense.service";
import { Expense } from "../models/expense.model";

class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const expenses = await this.expenseService.getAll();
      res.status(200).json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching expenses", error });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const expense = await this.expenseService.getById(req.params.id);
      if (!expense) {
        res.status(404).json({ message: "Expense not found" });
        return;
      }
      res.status(200).json(expense);
    } catch (error) {
      res.status(500).json({ message: "Error fetching expense", error });
    }
  }

  async getByEmployeeId(req: Request, res: Response): Promise<void> {
    try {
      const expenses = await this.expenseService.getByEmployeeId(
        req.params.employeeId
      );
      res.status(200).json(expenses);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error fetching employee expenses", error });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const expenseData: Omit<Expense, "_id" | "createdAt" | "updatedAt"> =
        req.body;
      const newExpense = await this.expenseService.create(expenseData);
      res.status(201).json(newExpense);
    } catch (error) {
      res.status(500).json({ message: "Error creating expense", error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const expenseData: Partial<Expense> = req.body;
      const updatedExpense = await this.expenseService.update(
        req.params.id,
        expenseData
      );
      if (!updatedExpense) {
        res.status(404).json({ message: "Expense not found" });
        return;
      }
      res.status(200).json(updatedExpense);
    } catch (error) {
      res.status(500).json({ message: "Error updating expense", error });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const deletedExpense = await this.expenseService.delete(req.params.id);
      if (!deletedExpense) {
        res.status(404).json({ message: "Expense not found" });
        return;
      }
      res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting expense", error });
    }
  }
}

export default new ExpenseController(expenseServiceInstance);
