const service = require('../services/campeones.service');
const { calcularKda } = require('../utils/kda');

function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'modulos CommonJS'
  });
}

function listar(req, res) {
  res.json({ ok: true, data: service.getCampeones() });
}

function obtener(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un numero' });
  }

  const campeon = service.buscarCampeon(id);

  if (!campeon) {
    return res.status(404).json({ ok: false, message: 'Campeon no encontrado' });
  }

  res.json({ ok: true, data: campeon });
}

function kda(req, res) {
  const kills = Number(req.query.kills);
  const deaths = Number(req.query.deaths);
  const assists = Number(req.query.assists);

  if (Number.isNaN(kills) || Number.isNaN(deaths) || Number.isNaN(assists)) {
    return res.status(400).json({ ok: false, message: 'kills, deaths y assists deben ser numeros' });
  }

  res.json({ ok: true, kda: calcularKda(kills, deaths, assists) });
}

module.exports = { principal, listar, obtener, kda };
