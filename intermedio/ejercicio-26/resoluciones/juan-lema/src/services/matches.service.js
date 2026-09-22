import { AppError } from "../errors.js";

const MAPS = Object.freeze(["Arena Cruce", "Muelle Norte", "Fabrica Roja", "Cañon Seco"]);
const RANK_TIERS = Object.freeze([
  { max: 999, tier: "bronce" },
  { max: 1499, tier: "plata" },
  { max: 1999, tier: "oro" },
  { max: 2499, tier: "platino" },
  { max: Infinity, tier: "diamante" },
]);
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;
const ID_PATTERN = /^[1-9]\d*$/;

const invalid = (code, message) => new AppError(400, code, message);
const tierOf = (rank) => RANK_TIERS.find((t) => rank <= t.max).tier;
const round = (value) => Math.round(value);

function checkPlayers(players) {
  if (!Array.isArray(players) || players.length < MIN_PLAYERS || players.length > MAX_PLAYERS) throw invalid("INVALID_BODY", `players debe ser un arreglo de ${MIN_PLAYERS} a ${MAX_PLAYERS} ids`);
  if (!players.every((id) => Number.isInteger(id) && id > 0)) throw invalid("INVALID_BODY", "cada player debe ser un entero positivo");
  if (new Set(players).size !== players.length) throw invalid("INVALID_BODY", "players no puede tener ids repetidos");
}

async function fetchRanks(rankingClient, players) {
  try {
    return await Promise.all(players.map((playerId) => rankingClient.getRank(playerId)));
  } catch (cause) {
    throw new AppError(502, "RANKING_UNAVAILABLE", "No se pudo consultar el ranking de los jugadores");
  }
}

function createMatchesService({ rankingClient, now = () => new Date() }) {
  const matches = [];
  let nextId = 1;

  function findById(id) {
    if (!ID_PATTERN.test(id)) throw invalid("INVALID_ID", "id debe ser un entero positivo");

    const match = matches.find((m) => m.id === Number(id));
    if (!match) throw new AppError(404, "NOT_FOUND", `Partida ${id} no encontrada`);
    return match;
  }

  const list = () => matches.map((m) => ({ ...m }));
  const getById = (id) => ({ ...findById(id) });

  async function create({ mapName, players } = {}) {
    if (!MAPS.includes(mapName)) throw invalid("INVALID_BODY", `mapName debe ser uno de: ${MAPS.join(", ")}`);
    checkPlayers(players);

    const ranks = await fetchRanks(rankingClient, players);
    const known = ranks.filter((rank) => rank !== null);
    const averageRank = known.length ? round(known.reduce((sum, rank) => sum + rank, 0) / known.length) : null;

    const match = {
      id: nextId++,
      mapName,
      players: players.map((playerId, index) => ({ playerId, rank: ranks[index] })),
      averageRank,
      tier: averageRank === null ? "sin-clasificar" : tierOf(averageRank),
      createdAt: now().toISOString(),
    };
    matches.push(match);
    return { ...match };
  }

  return { list, getById, create };
}

export { createMatchesService, MAPS };
