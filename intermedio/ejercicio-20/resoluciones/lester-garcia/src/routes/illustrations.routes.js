import { Router } from "express";
import {
  getCorsPolicyController,
  getAllIllustrationsController,
  getIllustrationByIdController,
  createIllustrationController
} from "../controllers/illustrations.controller.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { createIllustrationValidator } from "../middlewares/validators/illustration.validator.js";

const router = Router();

router.get("/cors-policy", getCorsPolicyController);
router.get("/", getAllIllustrationsController);
router.get("/:id", getIllustrationByIdController);
router.post("/", validate(createIllustrationValidator), createIllustrationController);

export default router;
