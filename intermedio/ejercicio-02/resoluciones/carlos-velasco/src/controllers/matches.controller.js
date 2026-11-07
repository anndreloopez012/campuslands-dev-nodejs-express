const matchesService = require('../services/matches.service');
const mapsService = require('../services/maps.service');

function listarPartidas(req, res) {
  res.status(200).json({ ok: true, data: matchesService.listarPartidas() });
}

function obtenerPartida(req, res) {
  const partida = matchesService.obtenerPartida(Number(req.params.id));
  if (!partida) {
    return res.status(404).json({ ok: false, message: 'Partida no encontrada' });
  }
  return res.status(200).json({
    ok: true,
    data: { ...partida, mapa: mapsService.obtenerMapa(partida.mapId) }
  });
}

function crearPartida(req, res) {
  try {
    const partida = matchesService.crearPartida(req.body, mapsService);
    return res.status(201).json({ ok: true, message: 'Partida creada', data: partida });
  } catch (error) {
    return res.status(400).json({ ok: false, message: error.message });
  }
}

module.exports = { listarPartidas, obtenerPartida, crearPartida };
