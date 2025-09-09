import express from "express";
import vehicleController from "../controllers/vehicle.controller";

const router = express.Router();

router.post("/", vehicleController.create);
router.get("/", vehicleController.getAll);
router.get("/customer/:costumerId", vehicleController.getBycostumerId);
router.get("/search", vehicleController.search);

export default router;
