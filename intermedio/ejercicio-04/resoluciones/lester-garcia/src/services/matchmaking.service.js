import * as playersRepo from "../repositories/players.repository.js";
import * as lobbiesRepo from "../repositories/lobbies.repository.js";
import { NotFoundError, BadRequestError, ConflictError } from "../utils/customErrors.js";

// Función Reutilizable 1: Obtener y validar estado de un jugador
export const validateAndGetActivePlayer = async (playerId) => {
  const player = await playersRepo.findPlayerById(playerId);
  if (!player) {
    throw new NotFoundError(`El jugador con ID '${playerId}' no existe.`);
  }

  if (player.isBanned) {
    throw new BadRequestError(`El jugador '${player.gamertag}' tiene una suspensión activa y no puede unirse.`);
  }

  return player;
};

// Función Reutilizable 2: Validar compatibilidad de habilidad MMR
export const checkMMREligibility = (playerMMR, minMMR, maxMMR) => {
  if (playerMMR < minMMR || playerMMR > maxMMR) {
    throw new BadRequestError(
      `MMR incompatible (${playerMMR}). El lobby requiere un rango entre ${minMMR} y ${maxMMR}.`
    );
  }
  return true;
};

// Función Reutilizable 3: Obtener y validar disponibilidad de lobby
export const validateAndGetAvailableLobby = async (lobbyId) => {
  const lobby = await lobbiesRepo.findLobbyById(lobbyId);
  if (!lobby) {
    throw new NotFoundError(`El lobby con ID '${lobbyId}' no existe.`);
  }

  if (lobby.status !== "Waiting") {
    throw new ConflictError(`El lobby '${lobby.lobbyCode}' se encuentra en estado '${lobby.status}' y está cerrado.`);
  }

  if (lobby.playerIds.length >= lobby.maxCapacity) {
    throw new ConflictError(`El lobby '${lobby.lobbyCode}' ha alcanzado su capacidad máxima (${lobby.maxCapacity}).`);
  }

  return lobby;
};