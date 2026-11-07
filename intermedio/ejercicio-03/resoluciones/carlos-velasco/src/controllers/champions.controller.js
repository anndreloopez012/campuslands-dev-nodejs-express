const championsService = require('../services/champions.service');
const { AppError } = require('../errors/app.error');

const STATUS_OK = 200;
const STATUS_CREADO = 201;

async function listarCampeones(req, res, next) {
  try {
    const data = championsService.listarCampeones();
    return res.status(STATUS_OK).json({ ok: true, data });
  } catch (error) {
    return next(error);
  }
}

async function obtenerCampeon(req, res, next) {
  try {
    const data = championsService.obtenerCampeon(Number(req.params.id));
    return res.status(STATUS_OK).json({ ok: true, data });
  } catch (error) {
    return next(error);
  }
}

async function crearCampeon(req, res, next) {
  try {
    const data = championsService.crearCampeon(req.body, championsService);
    return res.status(STATUS_CREADO).json({ ok: true, message: 'Campeon creado', data });
  } catch (error) {
    return next(error);
  }
}

async function eliminarCampeon(req, res, next) {
  try {
    championsService.eliminarCampeon(Number(req.params.id));
    return res.status(STATUS_OK).json({ ok: true, message: 'Campeon eliminado' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listarCampeones, obtenerCampeon, crearCampeon, eliminarCampeon, AppError };
