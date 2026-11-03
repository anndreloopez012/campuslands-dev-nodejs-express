import {
  getAllMatchesService,
  getMatchByIdService,
  createMatchService
} from "../services/moba.service.js";
import { BadRequestError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllMatchesController = asyncHandler(async (req, res) => {
  const { tournamentName, patch, winner } = req.query;

  const matches = await getAllMatchesService({ tournamentName, patch, winner });

  return res.status(200).json({
    status: "success",
    total: matches.length,
    data: matches
  });
});

export const getMatchByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const match = await getMatchByIdService(id);

  return res.status(200).json({
    status: "success",
    data: match
  });
});

export const createMatchController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new BadRequestError("El cuerpo de la petición no puede estar vacío.");
  }

  const { tournamentName, teamA, teamB, patch, durationMinutes, winner, totalKills } = req.body;

  if (!tournamentName || typeof tournamentName !== "string" || tournamentName.trim() === "") {
    throw new BadRequestError("El campo 'tournamentName' es obligatorio.");
  }

  if (!teamA || typeof teamA !== "string" || teamA.trim() === "") {
    throw new BadRequestError("El campo 'teamA' (equipo A) es obligatorio.");
  }

  if (!teamB || typeof teamB !== "string" || teamB.trim() === "") {
    throw new BadRequestError("El campo 'teamB' (equipo B) es obligatorio.");
  }

  if (!patch || typeof patch !== "string" || patch.trim() === "") {
    throw new BadRequestError("El campo 'patch' es obligatorio.");
  }

  const duration = Number(durationMinutes);
  if (durationMinutes === undefined || isNaN(duration) || duration <= 0) {
    throw new BadRequestError("El campo 'durationMinutes' debe ser un número entero mayor a 0.");
  }

  if (!winner || typeof winner !== "string" || winner.trim() === "") {
    throw new BadRequestError("El campo 'winner' (equipo ganador) es obligatorio.");
  }

  const kills = Number(totalKills);
  if (totalKills === undefined || isNaN(kills) || kills < 0) {
    throw new BadRequestError("El campo 'totalKills' debe ser un número entero positivo.");
  }

  const newMatch = await createMatchService({
    tournamentName: tournamentName.trim(),
    teamA: teamA.trim(),
    teamB: teamB.trim(),
    patch: patch.trim(),
    durationMinutes: duration,
    winner: winner.trim(),
    totalKills: kills
  });

  return res.status(201).json({
    status: "success",
    data: newMatch
  });
});