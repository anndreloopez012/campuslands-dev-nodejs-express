const mapsService = require('../services/maps.service');

function listarMapas(req, res) {
  res.status(200).json({ ok: true, data: mapsService.listarMapas() });
}

function obtenerMapa(req, res) {
  const mapa = mapsService.obtenerMapa(Number(req.params.id));
  if (!mapa) {
    return res.status(404).json({ ok: false, message: 'Mapa no encontrado' });
  }
  return res.status(200).json({ ok: true, data: mapa });
}

function crearMapa(req, res) {
  try {
    const mapa = mapsService.crearMapa(req.body);
    return res.status(201).json({ ok: true, message: 'Mapa creado', data: mapa });
  } catch (error) {
    return res.status(400).json({ ok: false, message: error.message });
  }
}

module.exports = { listarMapas, obtenerMapa, crearMapa };
