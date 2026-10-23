const matchService = require("../services/match.service");

function getMatches(req, res) {
  const matches = matchService.getAllMatches();

  res.status(200).json({
    ok: true,
    message: "Partidos obtenidos correctamente",
    data: matches
  });
}

function createMatch(req, res) {
  const { homeTeam, awayTeam, modality } = req.body;

  if (!homeTeam || !awayTeam || !modality) {
    return res.status(400).json({
      ok: false,
      message: "Los campos homeTeam, awayTeam y modality son obligatorios"
    });
  }

  const validModalities = ["futbol", "futbol-sala"];

  if (!validModalities.includes(modality)) {
    return res.status(400).json({
      ok: false,
      message: "La modalidad debe ser futbol o futbol-sala"
    });
  }

  const match = matchService.createMatch({
    homeTeam,
    awayTeam,
    modality
  });

  return res.status(201).json({
    ok: true,
    message: "Partido creado correctamente",
    data: match
  });
}

module.exports = {
  getMatches,
  createMatch
};