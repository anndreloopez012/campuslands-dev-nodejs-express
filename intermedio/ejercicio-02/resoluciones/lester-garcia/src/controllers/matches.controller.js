import * as matchesService from "../services/matches.service.js";
import { BadRequestError, UnauthorizedError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const VALID_MODES = ["Competitive", "Premier", "Tournament", "Deathmatch"];

export const getMatchesController = asyncHandler(async (req, res) => {
  const { gameMode, isLive } = req.query;
  const matches = await matchesService.getAllMatchesService({ gameMode, isLive });
  return res.status(200).json({ status: "success", total: matches.length, data: matches });
});

export const getMatchByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const match = await matchesService.getMatchByIdService(id);
  return res.status(200).json({ status: "success", data: match });
});

export const createMatchController = asyncHandler(async (req, res) => {
  const auth = req.headers["x-tournament-key"];
  if (!auth || auth !== process.env.TOURNAMENT_SECRET_KEY) {
    throw new UnauthorizedError("Se requiere la llave de operador en el header 'x-tournament-key'.");
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new BadRequestError("El cuerpo de la petición no puede estar vacío.");
  }

  const { matchCode, mapName, gameMode, winnerTeam, isLive } = req.body;

  if (!matchCode || !mapName || !gameMode || !winnerTeam) {
    throw new BadRequestError("Los campos matchCode, mapName, gameMode y winnerTeam son obligatorios.");
  }

  if (!VALID_MODES.includes(gameMode.trim())) {
    throw new BadRequestError(`El modo de juego debe ser uno de: ${VALID_MODES.join(", ")}.`);
  }

  const newMatch = await matchesService.createMatchService({
    matchCode: matchCode.trim(),
    mapName: mapName.trim(),
    gameMode: gameMode.trim(),
    winnerTeam: winnerTeam.trim(),
    isLive
  });

  return res.status(201).json({ status: "success", data: newMatch });
});