import { Router } from "express";
import {
  getReviewsByMovieController,
  getReviewByIdController,
  createReviewController,
  deleteReviewController
} from "../controllers/reviews.controller.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { createReviewValidator } from "../middlewares/validators/review.validator.js";

// mergeParams: true preserva req.params del router padre (:movieId)
const router = Router({ mergeParams: true });

router.get("/", getReviewsByMovieController);
router.get("/:reviewId", getReviewByIdController);
router.post("/", validate(createReviewValidator), createReviewController);
router.delete("/:reviewId", deleteReviewController);

export default router;