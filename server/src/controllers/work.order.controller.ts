import e from "express";
import workOrderService from "../services/work.order.service";
import type { Request, Response } from "express";

class WorkOrderController {
    async create(req: Request, res: Response) {
        try {
            const data = req.body;
            console.log("Creating work order with data:", data);
            const workOrder = await workOrderService.create(data);

            res.status(201).json({
                success: true,
                message: "Work Order created successfully",
                data:  workOrder
            })
        } catch (error) {
            console.error("Error creating workorder:", error);
            res.status(500).json({
                success: false,
                message: "Failed to create workorder",
            });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const workOrders = await workOrderService.findAll();

            res.status(200).json({
                sucess: true,
                data: workOrders,
            })
        } catch (error) {
            console.error("Error fetching worke Orders", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch work orders"
            })
        }
    }
}

export default new WorkOrderController();