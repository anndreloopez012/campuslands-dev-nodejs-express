import { Router } from "express";
import {
  getAllWorkOrdersController,
  getWorkOrderByIdController,
  createWorkOrderController,
  deleteWorkOrderController
} from "../controllers/workOrders.controller.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { createWorkOrderValidator } from "../middlewares/validators/workOrder.validator.js";
import { requireGarageApiKey } from "../middlewares/garageAuth.middleware.js";

const router = Router();

router.get("/", getAllWorkOrdersController);
router.get("/:id", getWorkOrderByIdController);
router.post("/", requireGarageApiKey, validate(createWorkOrderValidator), createWorkOrderController);
router.delete("/:id", requireGarageApiKey, deleteWorkOrderController);

export default router;
