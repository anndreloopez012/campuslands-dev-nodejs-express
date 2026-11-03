import { Router } from "express";
import { listNaves, getNave, deleteNave } from "../controllers/naves.controller.js";

const router = Router();

router.get("/", listNaves);
router.get("/:id", getNave);
router.delete("/:id", deleteNave);

export default router;
