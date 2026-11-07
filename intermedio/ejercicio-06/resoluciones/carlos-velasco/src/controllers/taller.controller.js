const tallerService = require('../services/taller.service');

function listarMotos(req, res, next) {
  try {
    return res.status(200).json({ ok: true, data: tallerService.listarMotos() });
  } catch (error) {
    return next(error);
  }
}

function obtenerMoto(req, res, next) {
  try {
    return res.status(200).json({ ok: true, data: tallerService.obtenerMoto(Number(req.params.id)) });
  } catch (error) {
    return next(error);
  }
}

function crearMoto(req, res, next) {
  try {
    const data = tallerService.crearMoto(req.body);
    return res.status(201).json({ ok: true, message: 'Moto registrada', data });
  } catch (error) {
    return next(error);
  }
}

function listarOrdenes(req, res, next) {
  try {
    return res.status(200).json({ ok: true, data: tallerService.listarOrdenes() });
  } catch (error) {
    return next(error);
  }
}

function crearOrden(req, res, next) {
  try {
    const data = tallerService.crearOrden(req.body);
    return res.status(201).json({ ok: true, message: 'Orden de servicio creada', data });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listarMotos, obtenerMoto, crearMoto, listarOrdenes, crearOrden };
