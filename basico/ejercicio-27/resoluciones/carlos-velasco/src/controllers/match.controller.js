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
  const { teamA, teamB, map } = req.body;

  if (!teamA || !teamB || !map) {
    return res.status(400).json({
      ok: false,
      message: "Los campos teamA, teamB y map son obligatorios"
    });
  }

  const match = matchService.createMatch({
    teamA,
    teamB,
    map
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