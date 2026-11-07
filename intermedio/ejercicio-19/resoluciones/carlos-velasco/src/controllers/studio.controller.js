const studioService = require('../services/studio.service');

function listarServicios(req, res) {
  res.status(200).json({ ok: true, data: studioService.listarServicios() });
}

function reservar(req, res, next) {
  try {
    const turno = studioService.reservar(req.body);
    return res.status(201).json({ ok: true, message: 'Turno reservado', data: turno });
  } catch (error) {
    return next(error);
  }
}

function cancelar(req, res, next) {
  try {
    const cancelado = studioService.cancelar(Number(req.params.id));
    return res.status(200).json({ ok: true, message: 'Turno cancelado', data: cancelado });
  } catch (error) {
    return next(error);
  }
}

function infoEstudio(req, res) {
  res.status(200).json({ ok: true, data: studioService.horarioInfo() });
}

module.exports = { listarServicios, reservar, cancelar, infoEstudio };
