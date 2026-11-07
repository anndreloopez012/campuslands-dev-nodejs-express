const campeonesService = require('../services/champions.service');

function listarCampeones(req, res, next) {
  try {
    return res.status(200).json({ ok: true, data: campeonesService.listarCampeones(req.query.rol) });
  } catch (error) {
    return next(error);
  }
}

function obtenerCampeon(req, res) {
  const campeon = campeonesService.obtenerCampeon(Number(req.params.id));
  if (!campeon) {
    return res.status(404).json({ ok: false, error: 'NotFoundError', message: `El campeon ${req.params.id} no existe` });
  }
  return res.status(200).json({ ok: true, data: campeon });
}

function crearCampeon(req, res, next) {
  try {
    const campeon = campeonesService.crearCampeon(req.body);
    return res.status(201).json({ ok: true, message: 'Campeon creado', data: campeon });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listarCampeones, obtenerCampeon, crearCampeon };
