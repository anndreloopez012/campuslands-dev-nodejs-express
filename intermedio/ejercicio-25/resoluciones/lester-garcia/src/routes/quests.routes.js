import { Router } from "express";
import {
  getAllQuestsController,
  getQuestByIdController,
  createQuestController
} from "../controllers/quests.controller.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { createQuestValidator } from "../middlewares/validators/quest.validator.js";

const router = Router();

router.get("/", getAllQuestsController);
router.get("/:id", getQuestByIdController);
router.post("/", validate(createQuestValidator), createQuestController);

export default router;
