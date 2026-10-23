import { Router } from "express";
import { getReviews, getReview, postReview } from "../controllers/reviews.controller.js";

const router = Router({ mergeParams: true });

router.get("/", getReviews);
router.get("/:id", getReview);
router.post("/", postReview);

export default router;
