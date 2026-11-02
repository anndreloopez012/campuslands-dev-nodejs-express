import * as reviewsRepo from "../repositories/reviews.inMemory.repository.js";
import { getMovieByIdService } from "./movies.service.js";
import { NotFoundError } from "../utils/customErrors.js";

export const getReviewsByMovieService = async (movieId) => {
  // 1. Validar que la película padre exista (lanza 404 si no)
  await getMovieByIdService(movieId);

  // 2. Obtener reseñas pertenecientes a esa película
  const reviews = await reviewsRepo.findReviewsByMovieId(movieId);

  // 3. Calcular métricas agregadas
  const count = reviews.length;
  const averageRating = count > 0
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1))
    : 0;

  return {
    movieId: String(movieId),
    totalReviews: count,
    averageRating,
    reviews
  };
};

export const getReviewByIdAndMovieService = async (reviewId, movieId) => {
  await getMovieByIdService(movieId);

  const review = await reviewsRepo.findReviewByIdAndMovieId(reviewId, movieId);
  if (!review) {
    throw new NotFoundError(
      `La reseña con ID '${reviewId}' no existe para la película con ID '${movieId}'.`
    );
  }
  return review;
};

export const createReviewForMovieService = async (movieId, payload) => {
  const movie = await getMovieByIdService(movieId);

  const newReview = {
    id: String(Date.now()),
    movieId: String(movie.id),
    author: payload.author.trim(),
    rating: Number(payload.rating),
    comment: payload.comment.trim(),
    jumpScaresRating: payload.jumpScaresRating ? Number(payload.jumpScaresRating) : 3,
    createdAt: new Date().toISOString()
  };

  return await reviewsRepo.saveReview(newReview);
};

export const deleteReviewService = async (reviewId, movieId) => {
  await getMovieByIdService(movieId);

  const deleted = await reviewsRepo.removeReview(reviewId, movieId);
  if (!deleted) {
    throw new NotFoundError(
      `No se puede eliminar. La reseña con ID '${reviewId}' no existe para la película '${movieId}'.`
    );
  }
};