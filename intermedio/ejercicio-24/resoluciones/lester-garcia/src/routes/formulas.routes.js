import { Router } from "express";
import {
  getAllFormulasController,
  getFormulaByIdController,
  createFormulaController
} from "../controllers/formulas.controller.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { createFormulaValidator } from "../middlewares/validators/formula.validator.js";

const router = Router();

router.get("/", getAllFormulasController);
router.get("/:id", getFormulaByIdController);
router.post("/", validate(createFormulaValidator), createFormulaController);

export default router;
