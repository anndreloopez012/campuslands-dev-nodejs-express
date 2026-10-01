const matchService = require("../services/match.service");

function getAllMatches(req, res) {
  const matches = matchService.getAll();

  return res.status(200).json({
    ok: true,
    data: matches
  });
}

function getMatchById(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El ID debe ser un número entero positivo"
    });
  }

  const match = matchService.getById(id);

  if (!match) {
    return res.status(404).json({
      ok: false,
      message: "Partida competitiva no encontrada"
    });
  }

  return res.status(200).json({
    ok: true,
    data: match
  });
}

function createMatch(req, res) {
  const { name, game, players } = req.body;

  if (!name || !game || players === undefined) {
    return res.status(400).json({
      ok: false,
      message: "Los campos name, game y players son obligatorios"
    });
  }

  if (
    typeof name !== "string" ||
    typeof game !== "string" ||
    !Number.isInteger(players)
  ) {
    return res.status(400).json({
      ok: false,
      message: "name y game deben ser texto y players debe ser un número entero"
    });
  }

  if (players < 2) {
    return res.status(400).json({
      ok: false,
      message: "Una partida competitiva necesita al menos 2 jugadores"
    });
  }

  const newMatch = matchService.create({
    name: name.trim(),
    game: game.trim(),
    players,
    status: "waiting"
  });

  return res.status(201).json({
    ok: true,
    message: "Partida competitiva creada correctamente",
    data: newMatch
  });
}

function startMatch(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El ID debe ser un número entero positivo"
    });
  }

  const match = matchService.getById(id);

  if (!match) {
    return res.status(404).json({
      ok: false,
      message: "Partida competitiva no encontrada"
    });
  }

  if (match.status === "started") {
    return res.status(409).json({
      ok: false,
      message: "La partida ya se encuentra iniciada"
    });
  }

  const startedMatch = matchService.start(id);

  return res.status(200).json({
    ok: true,
    message: "Partida competitiva iniciada correctamente",
    data: startedMatch
  });
}

function deleteMatch(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El ID debe ser un número entero positivo"
    });
  }

  const deleted = matchService.remove(id);

  if (!deleted) {
    return res.status(404).json({
      ok: false,
      message: "Partida competitiva no encontrada"
    });
  }

  return res.status(204).send();
}

module.exports = {
  getAllMatches,
  getMatchById,
  createMatch,
  startMatch,
  deleteMatch
};