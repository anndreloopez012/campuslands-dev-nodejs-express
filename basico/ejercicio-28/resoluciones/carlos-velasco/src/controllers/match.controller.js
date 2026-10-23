const matchService = require("../services/match.service");

function getMatches(req, res) {
  const matches = matchService.getAllMatches();

  res.status(200).json({
    ok: true,
    message: "Partidas obtenidas correctamente",
    data: matches
  });
}

function createMatch(req, res) {
  const { player, location, players } = req.body;

  if (!player || !location || players === undefined) {
    return res.status(400).json({
      ok: false,
      message: "Los campos player, location y players son obligatorios"
    });
  }

  if (!Number.isInteger(players) || players <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El campo players debe ser un entero positivo"
    });
  }

  const match = matchService.createMatch({
    player,
    location,
    players
  });

  return res.status(201).json({
    ok: true,
    message: "Partida creada correctamente",
    data: match
  });
}

module.exports = {
  getMatches,
  createMatch
};