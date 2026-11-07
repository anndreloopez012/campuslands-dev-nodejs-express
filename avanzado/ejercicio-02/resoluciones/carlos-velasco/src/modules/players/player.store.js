/**
 * Almacen en memoria del modulo de jugadores.
 * Cada modulo es dueno de su propio almacen: puede crecer o cambiar a
 * una base de datos real sin tocar a los demas modulos.
 */
const players = new Map([
  [1, { id: 1, callsign: "Vecna", main: "sniper", aimRating: 91, reaction: 220, matches: 48, wins: 31 }],
  [2, { id: 2, callsign: "Ricochet", main: "triquetra", aimRating: 84, reaction: 180, matches: 52, wins: 29 }],
  [3, { id: 3, callsign: "Halcyon", main: "soporte", aimRating: 76, reaction: 250, matches: 40, wins: 18 }],
]);

let nextId = 4;

function list() {
  return [...players.values()];
}

function get(id) {
  const idNumber = Number(id);
  const player = players.get(idNumber);
  return player || null;
}

function create(playerInput) {
  const player = { id: nextId++, ...playerInput, matches: 0, wins: 0 };
  players.set(player.id, player);
  return player;
}

function registerResult(playerId, won) {
  const player = players.get(playerId);
  if (!player) {
    return null;
  }
  player.matches += 1;
  if (won) {
    player.wins += 1;
  }
  return player;
}

module.exports = { list, get, create, registerResult };
