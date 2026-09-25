const players = Object.freeze([{ id: 1, nickname: 'Nova', role: 'Carry', level: 24 }, { id: 2, nickname: 'Rook', role: 'Support', level: 21 }, { id: 3, nickname: 'Mika', role: 'Mid', level: 23 }]);
function listPlayers() { return players.map((player) => ({ ...player })); }
function findPlayer(id) { return listPlayers().find((player) => player.id === id); }
module.exports = { listPlayers, findPlayer };
