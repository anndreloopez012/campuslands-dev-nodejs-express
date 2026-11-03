import { Router } from "express";
import { listPeliculas, getPelicula } from "../controllers/peliculas.controller.js";
import resenasRoutes from "./resenas.routes.js";

const router = Router();

router.get("/", listPeliculas);
router.get("/:peliculaId", getPelicula);

// subrecurso: las resenas viven dentro de una pelicula
router.use("/:peliculaId/resenas", resenasRoutes);

export default router;
