import { Router } from "express";
import { getMovies, getMovie, postMovie } from "../controllers/movies.controller.js";
import reviewsRoutes from "./reviews.routes.js";

const router = Router();

router.get("/", getMovies);
router.get("/:id", getMovie);
router.post("/", postMovie);
router.use("/:movieId/reviews", reviewsRoutes);

export default router;
