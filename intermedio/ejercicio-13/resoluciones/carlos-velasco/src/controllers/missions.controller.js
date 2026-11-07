const fleetService = require('../services/fleet.service');

function listarMisiones(req, res) {
  res.status(200).json({ ok: true, data: fleetService.listarMisiones() });
}

function crearMision(req, res, next) {
  try {
    const mision = fleetService.crearMision(req.body);
    return res.status(201).json({ ok: true, message: 'Mision creada', data: mision });
  } catch (error) {
    return next(error);
  }
}

function asignarNave(req, res, next) {
  try {
    const mision = fleetService.asignarMision(Number(req.params.id), Number(req.body.naveId));
    return res.status(200).json({ ok: true, message: 'Nave asignada a la mision', data: mision });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listarMisiones, crearMision, asignarNave };
