import { Router } from "express";
import { getCompounds, getCompound, postCompound } from "../controllers/compounds.controller.js";

const router = Router();

router.get("/", getCompounds);
router.get("/:id", getCompound);
router.post("/", postCompound);

export default router;
