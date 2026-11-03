import { Router } from "express";
import { listObras, createObra, deleteObra } from "../controllers/obras.controller.js";

const router = Router();

router.get("/", listObras);
router.post("/", createObra);
router.delete("/:id", deleteObra);

export default router;
