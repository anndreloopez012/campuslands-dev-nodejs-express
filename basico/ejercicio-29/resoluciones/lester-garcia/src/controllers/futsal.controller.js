import {
  getAllMatchesService,
  getMatchByIdService,
  createMatchService
} from "../services/futsal.service.js";
import { BadRequestError, UnauthorizedError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const VALID_SURFACES = ["Parquet", "Sintético", "Interior (Pista)", "Cemento"];
const VALID_STATUSES = ["Scheduled", "Live", "Finished", "Postponed"];

export const getAllMatchesController = asyncHandler(async (req, res) => {
  const { matchStatus, surfaceType, team } = req.query;

  const matches = await getAllMatchesService({ matchStatus, surfaceType, team });

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
  const authHeader = req.headers["x-league-key"];
  if (!authHeader || authHeader !== process.env.LEAGUE_SECRET_KEY) {
    throw new UnauthorizedError("Credencial de liga inválida o ausente en el header 'x-league-key'.");
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new BadRequestError("El cuerpo de la petición no puede estar vacío.");
  }

  const { matchCode, homeTeam, awayTeam, homeGoals, awayGoals, surfaceType, matchStatus } = req.body;

  if (!matchCode || typeof matchCode !== "string" || matchCode.trim() === "") {
    throw new BadRequestError("El campo 'matchCode' es obligatorio.");
  }

  if (!homeTeam || typeof homeTeam !== "string" || homeTeam.trim() === "") {
    throw new BadRequestError("El campo 'homeTeam' (equipo local) es obligatorio.");
  }

  if (!awayTeam || typeof awayTeam !== "string" || awayTeam.trim() === "") {
    throw new BadRequestError("El campo 'awayTeam' (equipo visitante) es obligatorio.");
  }

  if (!surfaceType || !VALID_SURFACES.includes(surfaceType.trim())) {
    throw new BadRequestError(`El campo 'surfaceType' debe ser uno de: ${VALID_SURFACES.join(", ")}.`);
  }

  if (matchStatus && !VALID_STATUSES.includes(matchStatus.trim())) {
    throw new BadRequestError(`El campo 'matchStatus' debe ser uno de: ${VALID_STATUSES.join(", ")}.`);
  }

  const newMatch = await createMatchService({
    matchCode: matchCode.trim(),
    homeTeam: homeTeam.trim(),
    awayTeam: awayTeam.trim(),
    homeGoals,
    awayGoals,
    surfaceType: surfaceType.trim(),
    matchStatus: matchStatus ? matchStatus.trim() : "Scheduled"
  });

  return res.status(201).json({
    status: "success",
    data: newMatch
  });
});