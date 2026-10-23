import { Router } from "express";
import {
  getTattoosController,
  getTattooByIdController,
  getTattoosByArtistController
} from "../controllers/tattoos.controller.js";

const router = Router();

// 1. Manejo de req.query en la ruta raíz de la colección
router.get("/tattoos", getTattoosController);

// 2. Manejo de req.params para búsqueda por artista
router.get("/tattoos/artist/:artistName", getTattoosByArtistController);

// 3. Manejo de req.params para id específico
router.get("/tattoos/:id", getTattooByIdController);

export default router;