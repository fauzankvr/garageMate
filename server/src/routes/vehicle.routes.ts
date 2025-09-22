import express from "express";
import vehicleController from "../controllers/vehicle.controller";

const router = express.Router();

router.post("/", vehicleController.create);
router.get("/", vehicleController.getAll);
router.get("/customer/:costumerId", vehicleController.getByCustomerId);
router.get("/search", vehicleController.search);
router.delete("/:id", vehicleController.delete);
router.patch("/:id", vehicleController.update);

export default router;
