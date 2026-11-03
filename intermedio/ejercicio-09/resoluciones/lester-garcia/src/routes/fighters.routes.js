import { Router } from "express";
import {
  getFightersController,
  getFighterByIdController
} from "../controllers/fighters.controller.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { paginationAndFilterValidator } from "../middlewares/validators/pagination.validator.js";

const router = Router();

router.get(
  "/fighters",
  validate(paginationAndFilterValidator),
  getFightersController
);

router.get("/fighters/:id", getFighterByIdController);

export default router;