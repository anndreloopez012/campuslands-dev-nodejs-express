import { movies, reviews } from '../data/movies.data.js';

const findMovie = (req) => movies.find((m) => m.id === Number(req.params.movieId));

export const listReviews = (req, res) => {
  if (!findMovie(req)) return res.status(404).json({ ok: false, message: "Película no encontrada" });

  const data = reviews.filter((r) => r.movieId === Number(req.params.movieId));
  res.status(200).json({ ok: true, total: data.length, data });
};

export const createReview = (req, res) => {
  if (!findMovie(req)) return res.status(404).json({ ok: false, message: "Película no encontrada" });

  const { author, rating, comment } = req.body || {};
  if (!author || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ ok: false, message: "Se requiere author y rating entero entre 1 y 5" });
  }

  const review = { id: Math.max(0, ...reviews.map((r) => r.id)) + 1, movieId: Number(req.params.movieId), author, rating, comment: comment || "" };
  reviews.push(review);
  res.status(201).json({ ok: true, data: review });
};
