const playerService = require("./player.service");

function listPlayers(req, res, next) {
  try {
    const players = playerService.list();
    res.status(200).json({ ok: true, count: players.length, data: players });
  } catch (error) {
    next(error);
  }
}

function getPlayerById(req, res, next) {
  try {
    res.status(200).json({ ok: true, data: playerService.getById(req.params.id) });
  } catch (error) {
    next(error);
  }
}

function createPlayer(req, res, next) {
  try {
    const player = playerService.registerPlayer(req.body);
    res.status(201).json({ ok: true, message: "Jugador registrado", data: player });
  } catch (error) {
    next(error);
  }
}

function getLeaderboard(req, res, next) {
  try {
    res.status(200).json({ ok: true, data: playerService.leaderboard() });
  } catch (error) {
    next(error);
  }
}

module.exports = { listPlayers, getPlayerById, createPlayer, getLeaderboard };
