const moviesService = require('../services/movies.service');

function listarPeliculas(req, res) {
  res.status(200).json({ ok: true, data: moviesService.listarPeliculas() });
}

function obtenerPelicula(req, res, next) {
  try {
    const pelicula = moviesService.obtenerPelicula(Number(req.params.id));
    return res.status(200).json({ ok: true, data: pelicula });
  } catch (error) {
    return next(error);
  }
}

function crearPelicula(req, res, next) {
  try {
    const pelicula = moviesService.crearPelicula(req.body);
    return res.status(201).json({ ok: true, message: 'Pelicula creada', data: pelicula });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listarPeliculas, obtenerPelicula, crearPelicula };
