const { MapRepository } = require('../repositories/maps.repository');
const { NotFoundError } = require('../errors/app.error');

const seed = [
  { id: 1, name: 'Distrito 9', modo: 'tdm', maxJugadores: 12 },
  { id: 2, name: 'Torre Frente', modo: 'ctf', maxJugadores: 16 },
  { id: 3, name: 'Ruinas Verticales', modo: 'snd', maxJugadores: 8 }
];

// En produccion se inyecta el repositorio real; los tests inyectan el mock
const mapRepository = new MapRepository(seed);

const partidas = [];

function listarPartidas(req, res) {
  res.status(200).json({ ok: true, data: partidas });
}

function crearPartida(req, res, next) {
  try {
    const partida = matchService.crearPartida(req.body);
    partidas.push(partida);
    return res.status(201).json({ ok: true, message: 'Partida programada', data: partida });
  } catch (error) {
    return next(error);
  }
}

function listarMapas(req, res) {
  res.status(200).json({ ok: true, data: matchService.listarMapas() });
}

function obtenerMapa(req, res, next) {
  try {
    const mapa = matchService.obtenerMapa(Number(req.params.id));
    if (!mapa) throw new NotFoundError(`El mapa ${req.params.id} no existe`);
    return res.status(200).json({ ok: true, data: mapa });
  } catch (error) {
    return next(error);
  }
}

const { MatchService } = require('../services/matches.service');
const matchService = new MatchService({ mapRepository });

module.exports = { listarPartidas, crearPartida, listarMapas, obtenerMapa };
