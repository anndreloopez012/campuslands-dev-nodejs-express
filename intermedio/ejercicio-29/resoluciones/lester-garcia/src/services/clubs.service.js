import * as clubsRepo from "../repositories/clubs.inMemory.repository.js";
import { toClubStandingDTO } from "../utils/standingsMapper.js";
import { NotFoundError, ConflictError } from "../utils/customErrors.js";

export const getStandingsTableService = async (modalityFilter) => {
  let clubs = await clubsRepo.findAllClubs();

  if (modalityFilter) {
    clubs = clubs.filter((c) => c.modality.toLowerCase() === modalityFilter.trim().toLowerCase());
  }

  return clubs
    .map(toClubStandingDTO)
    .sort((a, b) => b.stats.points - a.stats.points || b.stats.goalDifference - a.stats.goalDifference);
};

export const getClubByIdService = async (id) => {
  const club = await clubsRepo.findClubById(id);
  if (!club) {
    throw new NotFoundError(`El club con ID '${id}' no existe en la liga.`);
  }
  return toClubStandingDTO(club);
};

export const registerClubService = async (payload) => {
  const existing = await clubsRepo.findClubByName(payload.clubName);
  if (existing) {
    throw new ConflictError(`El club '${payload.clubName}' ya se encuentra inscrito.`);
  }

  const all = await clubsRepo.findAllClubs();
  const nextId = `CLB-${String(all.length + 1).padStart(2, "0")}`;

  const rawClub = {
    id: nextId,
    clubName: payload.clubName.trim(),
    modality: payload.modality.trim(),
    wins: Number(payload.wins),
    draws: Number(payload.draws),
    losses: Number(payload.losses),
    goalsFor: Number(payload.goalsFor),
    goalsAgainst: Number(payload.goalsAgainst),
    createdAt: new Date().toISOString()
  };

  const saved = await clubsRepo.saveClub(rawClub);
  return toClubStandingDTO(saved);
};
