import { Router } from "express";
import { listResenas, getResena, createResena, deleteResena } from "../controllers/resenas.controller.js";

// mergeParams para poder leer :peliculaId del router padre
const router = Router({ mergeParams: true });

router.get("/", listResenas);
router.post("/", createResena);
router.get("/:resenaId", getResena);
router.delete("/:resenaId", deleteResena);

export default router;
