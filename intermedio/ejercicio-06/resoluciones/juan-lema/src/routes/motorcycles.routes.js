import { Router } from "express";
import { getMotorcycles, getMotorcycle, postMotorcycle } from "../controllers/motorcycles.controller.js";
import { validateMotorcycle } from "../middlewares/validate.js";

const router = Router();

router.get("/", getMotorcycles);
router.get("/:id", getMotorcycle);
router.post("/", validateMotorcycle, postMotorcycle);

export default router;
