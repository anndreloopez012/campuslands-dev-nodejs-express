import { listMovies, getMovieById, createMovie } from "../services/movies.service.js";

const getMovies = (req, res) => res.json({ ok: true, data: listMovies() });

function getMovie(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ ok: false, message: "id debe ser numerico" });

  const movie = getMovieById(id);
  if (!movie) return res.status(404).json({ ok: false, message: `Pelicula con id ${id} no encontrada` });

  res.json({ ok: true, data: movie });
}

function postMovie(req, res) {
  try {
    res.status(201).json({ ok: true, data: createMovie(req.body || {}) });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getMovies, getMovie, postMovie };
