import * as lobbiesRepo from "../repositories/lobbies.repository.js";
import {
  validateAndGetActivePlayer,
  checkMMREligibility,
  validateAndGetAvailableLobby
} from "./matchmaking.service.js";
import { ConflictError, BadRequestError } from "../utils/customErrors.js";

const VALID_MODES = ["Solo", "Duo", "Squad"];

export const getAllLobbiesService = async (filters = {}) => {
  let lobbies = await lobbiesRepo.findAllLobbies();
  const { mode, status, mapName } = filters;

  if (mode) {
    lobbies = lobbies.filter((l) => l.mode.toLowerCase() === mode.toLowerCase());
  }
  if (status) {
    lobbies = lobbies.filter((l) => l.status.toLowerCase() === status.toLowerCase());
  }
  if (mapName) {
    lobbies = lobbies.filter((l) => l.mapName.toLowerCase().includes(mapName.toLowerCase()));
  }

  return lobbies;
};

export const getLobbyByIdService = async (id) => {
  const lobby = await lobbiesRepo.findLobbyById(id);
  if (!lobby) {
    throw new BadRequestError(`No existe el lobby con ID '${id}'.`);
  }
  return lobby;
};

export const createLobbyService = async (payload) => {
  const { lobbyCode, mapName, mode, minMMR, maxMMR, maxCapacity } = payload;

  if (!lobbyCode || !mapName || !mode) {
    throw new BadRequestError("Los campos lobbyCode, mapName y mode son obligatorios.");
  }

  if (!VALID_MODES.includes(mode)) {
    throw new BadRequestError(`El modo de juego debe ser uno de: ${VALID_MODES.join(", ")}.`);
  }

  const min = Number(minMMR);
  const max = Number(maxMMR);
  if (isNaN(min) || isNaN(max) || min >= max) {
    throw new BadRequestError("minMMR y maxMMR deben ser numéricos y minMMR debe ser menor a maxMMR.");
  }

  const existing = await lobbiesRepo.findLobbyByCode(lobbyCode);
  if (existing) {
    throw new ConflictError(`El código de lobby '${lobbyCode}' ya está en uso.`);
  }

  const newLobby = {
    id: String(Date.now()),
    lobbyCode: lobbyCode.trim(),
    mapName: mapName.trim(),
    mode,
    minMMR: min,
    maxMMR: max,
    maxCapacity: Number(maxCapacity) || 100,
    playerIds: [],
    status: "Waiting"
  };

  return await lobbiesRepo.saveLobby(newLobby);
};

// Reutiliza los 3 servicios atómicos
export const joinLobbyService = async (lobbyId, playerId) => {
  // 1. Reutilización: valida si el jugador existe y si está activo (no baneado)
  const player = await validateAndGetActivePlayer(playerId);

  // 2. Reutilización: valida si el lobby existe y si tiene cupos disponibles
  const lobby = await validateAndGetAvailableLobby(lobbyId);

  // 3. Verifica duplicados en el lobby
  if (lobby.playerIds.includes(String(playerId))) {
    throw new ConflictError(`El jugador '${player.gamertag}' ya se encuentra dentro de esta sala.`);
  }

  // 4. Reutilización: valida reglas de elegibilidad por MMR
  checkMMREligibility(player.mmr, lobby.minMMR, lobby.maxMMR);

  // 5. Inserción y actualización
  const updatedPlayerIds = [...lobby.playerIds, String(playerId)];
  const updatedLobby = await lobbiesRepo.updateLobbyInStore(lobbyId, {
    playerIds: updatedPlayerIds,
    status: updatedPlayerIds.length >= lobby.maxCapacity ? "In Game" : "Waiting"
  });

  return {
    lobby: updatedLobby,
    joinedPlayer: {
      id: player.id,
      gamertag: player.gamertag,
      mmr: player.mmr
    }
  };
};