import { Router } from "express";
import {
  getCompounds,
  getCompound,
  postCompound,
  putCompound,
  removeCompound,
} from "../controllers/compounds.controller.js";

const router = Router();

router.get("/", getCompounds);
router.get("/:id", getCompound);
router.post("/", postCompound);
router.put("/:id", putCompound);
router.delete("/:id", removeCompound);

export default router;
