import { Router } from "express";
import {
  getPlanetsController,
  getPlanetByIdController,
  deletePlanetController
} from "../controllers/planets.controller.js";

const router = Router();

router.get("/", getPlanetsController);
router.get("/:id", getPlanetByIdController);
router.delete("/:id", deletePlanetController);

export default router;