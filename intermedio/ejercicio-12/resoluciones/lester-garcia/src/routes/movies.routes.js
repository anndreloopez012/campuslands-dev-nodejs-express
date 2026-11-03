import { Router } from "express";
import {
  getMoviesController,
  getMovieByIdController
} from "../controllers/movies.controller.js";
import reviewsRouter from "./reviews.routes.js";

const router = Router();

// Rutas de películas (Recurso Padre)
router.get("/", getMoviesController);
router.get("/:id", getMovieByIdController);

// Montaje del subrecurso anidado: /movies/:movieId/reviews
router.use("/:movieId/reviews", reviewsRouter);

export default router;