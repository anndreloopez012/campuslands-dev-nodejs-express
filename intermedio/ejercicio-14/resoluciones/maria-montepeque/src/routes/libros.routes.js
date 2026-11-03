import { Router } from "express";
import { listLibros, getLibro, createLibro, deleteLibro } from "../controllers/libros.controller.js";
import { requireAuth, requireRol } from "../middlewares/auth.middleware.js";

const router = Router();

// leer es publico
router.get("/", listLibros);
router.get("/:id", getLibro);

// crear pide login, borrar pide login y ser admin
router.post("/", requireAuth, createLibro);
router.delete("/:id", requireAuth, requireRol("admin"), deleteLibro);

export default router;
