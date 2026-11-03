const SORTABLE_FIELDS = ["name", "ranking", "wins"];

const players = [
  { id: 1, name: "Bianca Ortiz", ranking: 3, wins: 18 },
  { id: 2, name: "Marco Ueda", ranking: 1, wins: 24 },
  { id: 3, name: "Sofia Lang", ranking: 2, wins: 20 },
  { id: 4, name: "Ivo Petric", ranking: 5, wins: 9 },
  { id: 5, name: "Ana Duval", ranking: 4, wins: 12 },
];
let nextId = 6;

function listPlayers({ sortBy = "ranking", order = "asc" } = {}) {
  const dir = order === "desc" ? -1 : 1;

  return [...players].sort((a, b) => {
    if (typeof a[sortBy] === "string") return a[sortBy].localeCompare(b[sortBy]) * dir;
    return (a[sortBy] - b[sortBy]) * dir;
  });
}

const getPlayerById = (id) => players.find((p) => p.id === Number(id)) || null;

function createPlayer({ name, ranking, wins }) {
  if (!name || typeof name !== "string" || !name.trim()) throw new Error("name es obligatorio");

  const numericRanking = Number(ranking);
  if (!ranking || Number.isNaN(numericRanking) || numericRanking <= 0) throw new Error("ranking debe ser un numero mayor a 0");

  const numericWins = wins === undefined ? 0 : Number(wins);
  if (Number.isNaN(numericWins) || numericWins < 0) throw new Error("wins debe ser un numero mayor o igual a 0");

  const player = { id: nextId++, name: name.trim(), ranking: numericRanking, wins: numericWins };
  players.push(player);
  return player;
}

export { SORTABLE_FIELDS, listPlayers, getPlayerById, createPlayer };
