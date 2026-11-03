import { getMovieById } from "../services/movies.service.js";
import { listReviewsByMovie, getReviewById, createReview } from "../services/reviews.service.js";

function findMovie(req, res) {
  const { movieId } = req.params;
  if (!Number.isInteger(Number(movieId))) return void res.status(400).json({ ok: false, message: "movieId debe ser numerico" });

  const movie = getMovieById(movieId);
  if (!movie) return void res.status(404).json({ ok: false, message: `Pelicula con id ${movieId} no encontrada` });

  return movie;
}

function getReviews(req, res) {
  const movie = findMovie(req, res);
  if (movie) res.json({ ok: true, movie: movie.title, data: listReviewsByMovie(movie.id) });
}

function getReview(req, res) {
  const movie = findMovie(req, res);
  if (!movie) return;

  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ ok: false, message: "id debe ser numerico" });

  const review = getReviewById(movie.id, id);
  if (!review) return res.status(404).json({ ok: false, message: `Resena con id ${id} no encontrada en la pelicula ${movie.id}` });

  res.json({ ok: true, data: review });
}

function postReview(req, res) {
  const movie = findMovie(req, res);
  if (!movie) return;

  try {
    res.status(201).json({ ok: true, data: createReview(movie.id, req.body || {}) });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getReviews, getReview, postReview };
