const players = [
  { id: 1, nickname: "Rook", squad: "Buitres", kills: 5, alive: true },
  { id: 2, nickname: "Fable", squad: "Buitres", kills: 2, alive: false },
  { id: 3, nickname: "Nyx", squad: "Coyotes", kills: 8, alive: true },
];
let nextId = 4;

const listPlayers = () => players;
const getPlayerById = (id) => players.find((p) => p.id === Number(id)) || null;

function createPlayer({ nickname, squad, kills, alive }) {
  if (!nickname || typeof nickname !== "string" || !nickname.trim()) throw new Error("nickname es obligatorio");
  if (!squad || typeof squad !== "string" || !squad.trim()) throw new Error("squad es obligatorio");

  const numericKills = kills === undefined ? 0 : Number(kills);
  if (Number.isNaN(numericKills) || numericKills < 0) throw new Error("kills debe ser un numero mayor o igual a 0");

  const player = {
    id: nextId++,
    nickname: nickname.trim(),
    squad: squad.trim(),
    kills: numericKills,
    alive: alive === undefined ? true : Boolean(alive),
  };
  players.push(player);
  return player;
}

export { listPlayers, getPlayerById, createPlayer };
