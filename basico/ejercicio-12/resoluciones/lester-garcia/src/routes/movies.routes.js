import { Router } from "express";
import {
  getMoviesController,
  getMovieByIdController,
  analyzeScareController,
  createMovieController
} from "../controllers/movies.controller.js";

const router = Router();

router.get("/movies", getMoviesController);
router.get("/movies/:id", getMovieByIdController);
router.get("/movies/:id/scare-analysis", analyzeScareController);
router.post("/movies", createMovieController);

export default router;