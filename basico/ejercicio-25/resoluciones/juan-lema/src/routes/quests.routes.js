import { Router } from "express";
import { getQuests, getQuest, postQuest, removeQuest } from "../controllers/quests.controller.js";

const router = Router();

router.get("/", getQuests);
router.get("/:id", getQuest);
router.post("/", postQuest);
router.delete("/:id", removeQuest);

export default router;
