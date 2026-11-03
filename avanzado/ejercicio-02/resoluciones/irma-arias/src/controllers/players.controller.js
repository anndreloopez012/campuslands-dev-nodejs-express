const { getPlayers } = require('../services/players.service');
exports.listPlayers = (req, res) => res.json({ players: getPlayers() });
