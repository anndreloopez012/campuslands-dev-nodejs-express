import {
  DomainError,
  SquadNotFoundError,
  SquadFullError,
  InvalidDropZoneError,
} from "../domain/errors.js";

const VALID_ZONES = ["Erangel", "Miramar", "Sanhok", "Vikendi"];

const squads = [
  { id: 1, name: "Alpha Wolves", maxMembers: 2, members: ["Raptor"], dropZone: "Erangel" },
];

function listSquads() {
  return squads;
}

function deployPlayerToSquad(squadId, { player, dropZone }) {
  if (!player || typeof player !== "string" || !player.trim()) {
    throw new DomainError("INVALID_PLAYER", "El nombre del jugador es obligatorio");
  }

  const squad = squads.find((s) => s.id === Number(squadId));
  if (!squad) {
    throw new SquadNotFoundError(squadId);
  }

  if (!VALID_ZONES.includes(dropZone)) {
    throw new InvalidDropZoneError(dropZone, VALID_ZONES);
  }

  if (squad.members.length >= squad.maxMembers) {
    throw new SquadFullError(squad.name);
  }

  squad.members.push(player.trim());
  squad.dropZone = dropZone;
  return squad;
}

export { listSquads, deployPlayerToSquad };
