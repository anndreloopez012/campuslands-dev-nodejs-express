const inspectionService = require('../services/inspection.service');

function listarInspecciones(req, res) {
  res.status(200).json({ ok: true, data: inspectionService.listarInspecciones() });
}

function consultarInspeccion(req, res, next) {
  try {
    return res.status(200).json({ ok: true, data: inspectionService.consultarInspeccion(Number(req.params.id)) });
  } catch (error) {
    return next(error);
  }
}

function registrarInspeccion(req, res, next) {
  try {
    const registro = inspectionService.registrarInspeccion(req.body);
    return res.status(201).json({ ok: true, message: 'Inspeccion registrada', data: registro });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listarInspecciones, consultarInspeccion, registrarInspeccion };
