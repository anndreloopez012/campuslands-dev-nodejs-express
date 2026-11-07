const showroomService = require('../services/showroom.service');
const asyncHandler = require('../middlewares/async.handler');

async function listarAutos(req, res) {
  // La funcion es async: si el servicio falla, el reject llega al errorHandler sin try/catch.
  const autos = await showroomService.listarAutosLento();
  res.status(200).json({ ok: true, data: autos });
}

async function reservarAuto(req, res) {
  const auto = showroomService.reservarAuto(Number(req.params.id), req.body);
  res.status(200).json({ ok: true, message: 'Auto reservado', data: auto });
}

async function liberarAuto(req, res) {
  const auto = showroomService.liberarAuto(Number(req.params.id));
  res.status(200).json({ ok: true, message: 'Auto liberado', data: auto });
}

module.exports = { listarAutos, reservarAuto, liberarAuto };
