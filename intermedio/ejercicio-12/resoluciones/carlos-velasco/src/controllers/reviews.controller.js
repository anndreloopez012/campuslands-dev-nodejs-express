const moviesService = require('../services/movies.service');

function listarResenas(req, res, next) {
  try {
    const data = moviesService.listarResenas(Number(req.params.peliculaId));
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    return next(error);
  }
}

function obtenerResena(req, res, next) {
  try {
    const data = moviesService.obtenerResena(Number(req.params.peliculaId), Number(req.params.id));
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    return next(error);
  }
}

function crearResena(req, res, next) {
  try {
    const data = moviesService.crearResena(Number(req.params.peliculaId), req.body);
    return res.status(201).json({ ok: true, message: 'Resena creada', data });
  } catch (error) {
    return next(error);
  }
}

function eliminarResena(req, res, next) {
  try {
    moviesService.eliminarResena(Number(req.params.peliculaId), Number(req.params.id));
    return res.status(200).json({ ok: true, message: 'Resena eliminada' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listarResenas, obtenerResena, crearResena, eliminarResena };
