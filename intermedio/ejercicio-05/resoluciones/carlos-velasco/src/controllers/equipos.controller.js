const equiposService = require('../services/equipos.service');

function listarEquipos(req, res, next) {
  try {
    const data = equiposService.listarEquipos({
      filtro: req.query.filtro,
      orden: req.query.orden
    });
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    return next(error);
  }
}

function obtenerEquipo(req, res, next) {
  try {
    const data = equiposService.obtenerEquipo(Number(req.params.id));
    return res.status(200).json({ ok: true, data });
  } catch (error) {
    return next(error);
  }
}

function crearEquipo(req, res, next) {
  try {
    const data = equiposService.crearEquipo(req.body);
    return res.status(201).json({ ok: true, message: 'Equipo creado', data });
  } catch (error) {
    return next(error);
  }
}

function actualizarEquipo(req, res, next) {
  try {
    const data = equiposService.actualizarEquipo(Number(req.params.id), req.body);
    return res.status(200).json({ ok: true, message: 'Equipo actualizado', data });
  } catch (error) {
    return next(error);
  }
}

function eliminarEquipo(req, res, next) {
  try {
    equiposService.eliminarEquipo(Number(req.params.id));
    return res.status(200).json({ ok: true, message: 'Equipo eliminado' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listarEquipos, obtenerEquipo, crearEquipo, actualizarEquipo, eliminarEquipo };
