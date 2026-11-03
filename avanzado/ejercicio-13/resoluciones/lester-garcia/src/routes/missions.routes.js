import { Router } from "express";
import { listItems, getItemById, createItem } from "../controllers/missions.controller.js";

const router = Router();

router.get("/", listItems);
router.get("/:id", getItemById);
router.post("/", createItem);

export default router;
