import { Router } from "express";
import {
  getHypercarsController,
  getHypercarByIdController,
  createHypercarController,
  deleteHypercarController
} from "../controllers/hypercars.controller.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { createHypercarValidator } from "../middlewares/validators/hypercar.validator.js";

const router = Router();

router.get("/hypercars", getHypercarsController);
router.get("/hypercars/:id", getHypercarByIdController);
router.post("/hypercars", validate(createHypercarValidator), createHypercarController);
router.delete("/hypercars/:id", deleteHypercarController);

export default router;