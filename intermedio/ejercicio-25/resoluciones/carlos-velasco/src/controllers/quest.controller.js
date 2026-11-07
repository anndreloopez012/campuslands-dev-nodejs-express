const questService = require('../services/quest.service');

function listarMisiones(req, res) {
  res.status(200).json({ ok: true, data: questService.listarMisiones() });
}

function crearMision(req, res, next) {
  try {
    const mision = questService.crearMision(req.body);
    return res.status(201).json({ ok: true, message: 'Mision creada', data: mision });
  } catch (error) {
    return next(error);
  }
}

function asignarMision(req, res, next) {
  try {
    const mision = questService.asignarMision(Number(req.params.id), Number(req.body.heroeId));
    return res.status(200).json({ ok: true, message: 'Mision asignada', data: mision });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listarMisiones, crearMision, asignarMision };
