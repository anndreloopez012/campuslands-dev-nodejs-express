import { buscarPelicula } from '../services/peliculas.service.js';

export function obtenerPelicula(req, res, next) {
  try {
    const pelicula = buscarPelicula(req.params.id);

    res.json({
      ok: true,
      pelicula
    });
  } catch (error) {
    next(error);
  }
}