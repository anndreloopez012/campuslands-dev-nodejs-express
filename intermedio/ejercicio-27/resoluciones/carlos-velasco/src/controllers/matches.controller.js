const matchesService = require('../services/matches.service');

function listarPartidas(req, res) {
  res.status(200).json({ ok: true, data: matchesService.listarPartidas() });
}

function crearPartida(req, res, next) {
  try {
    const partida = matchesService.crearPartida(req.body);
    return res.status(201).json({ ok: true, message: 'Partida programada', data: partida });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listarPartidas, crearPartida };
