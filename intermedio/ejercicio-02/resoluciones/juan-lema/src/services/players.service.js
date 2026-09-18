const players = [
  { id: 1, nickname: "Viper", team: "Halcones Rojos", kills: 24 },
  { id: 2, nickname: "Ashen", team: "Lobos Grises", kills: 18 },
];
let nextId = 3;

function listPlayers() {
  return players;
}

function getPlayerById(id) {
  return players.find((player) => player.id === Number(id)) || null;
}

function createPlayer({ nickname, team, kills }) {
  if (!nickname || typeof nickname !== "string" || !nickname.trim()) {
    throw new Error("nickname es obligatorio");
  }

  if (!team || typeof team !== "string" || !team.trim()) {
    throw new Error("team es obligatorio");
  }

  const numericKills = kills === undefined ? 0 : Number(kills);
  if (Number.isNaN(numericKills) || numericKills < 0) {
    throw new Error("kills debe ser un numero mayor o igual a 0");
  }

  const player = { id: nextId++, nickname: nickname.trim(), team: team.trim(), kills: numericKills };
  players.push(player);
  return player;
}

export { listPlayers, getPlayerById, createPlayer };
