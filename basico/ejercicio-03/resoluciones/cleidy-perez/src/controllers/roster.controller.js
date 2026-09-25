const { listPlayers, findPlayer } = require('../services/roster.service');
function getRoster() { return { ok: true, topic: 'modulos CommonJS', players: listPlayers() }; }
function getPlayer(id) { const player = findPlayer(id); return player ? { ok: true, player } : { ok: false, error: 'Jugador no encontrado' }; }
module.exports = { getRoster, getPlayer };
