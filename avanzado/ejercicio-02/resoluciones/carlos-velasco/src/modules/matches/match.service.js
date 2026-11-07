const { ValidationError, NotFoundError } = require("../../core/errors/app.error");
const playerService = require("../players/player.service");
const matchStore = require("./match.store");

/**
 * El modulo de partidas coordina el resultado con el modulo de jugadores
 * a traves de la interfaz publica del servicio: nunca toca su almacen
 * directamente. Esa es la frontera que mantiene la arquitectura escalable.
 */
function registerMatch(input) {
  const playerId = Number(input?.playerId);
  const winnerId = Number(input?.winnerId);
  if (!Number.isInteger(playerId) || playerId <= 0) {
    throw new ValidationError("playerId debe ser un entero positivo");
  }
  if (!Number.isInteger(winnerId) || winnerId <= 0) {
    throw new ValidationError("winnerId debe ser un entero positivo");
  }
  if (!playerService.getById(playerId) || !playerService.getById(winnerId)) {
    throw new NotFoundError("El jugador o el ganador de la partida no existen");
  }

  const match = matchStore.save({
    id: matchStore.nextId(),
    playerId,
    winnerId,
    finishedAt: new Date().toISOString(),
  });

  playerService.applyResult(playerId, winnerId === playerId);

  return match;
}

function listMatches() {
  return matchStore.list();
}

module.exports = { registerMatch, listMatches };
