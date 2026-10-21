import * as reviewsService from "../services/reviews.service.js";
import { UnauthorizedError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const assertAuthorized = (req) => {
  const key = req.headers["x-critic-key"];
  if (!key || key !== process.env.CRITIC_SECRET_KEY) {
    throw new UnauthorizedError("Se requiere clave de crítico autorizado en 'x-critic-key'.");
  }
};

export const getReviewsByMovieController = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  const result = await reviewsService.getReviewsByMovieService(movieId);

  return res.status(200).json({
    status: "success",
    requestId: req.id,
    meta: {
      movieId: result.movieId,
      totalReviews: result.totalReviews,
      averageRating: result.averageRating
    },
    data: result.reviews
  });
});

export const getReviewByIdController = asyncHandler(async (req, res) => {
  const { movieId, reviewId } = req.params;
  const review = await reviewsService.getReviewByIdAndMovieService(reviewId, movieId);

  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: review
  });
});

export const createReviewController = asyncHandler(async (req, res) => {
  assertAuthorized(req);
  const { movieId } = req.params;
  const newReview = await reviewsService.createReviewForMovieService(movieId, req.body);

  return res.status(201).json({
    status: "success",
    requestId: req.id,
    data: newReview
  });
});

export const deleteReviewController = asyncHandler(async (req, res) => {
  assertAuthorized(req);
  const { movieId, reviewId } = req.params;
  await reviewsService.deleteReviewService(reviewId, movieId);

  return res.status(204).send();
});