import * as playersService from "../services/players.service.js";
import { BadRequestError, UnauthorizedError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getPlayersController = asyncHandler(async (req, res) => {
  const { team, mainAgent } = req.query;
  const players = await playersService.getAllPlayersService({ team, mainAgent });
  return res.status(200).json({ status: "success", total: players.length, data: players });
});

export const getPlayerByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const player = await playersService.getPlayerByIdService(id);
  return res.status(200).json({ status: "success", data: player });
});

export const createPlayerController = asyncHandler(async (req, res) => {
  const auth = req.headers["x-tournament-key"];
  if (!auth || auth !== process.env.TOURNAMENT_SECRET_KEY) {
    throw new UnauthorizedError("Se requiere la llave de operador en el header 'x-tournament-key'.");
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new BadRequestError("El cuerpo de la petición no puede estar vacío.");
  }

  const { gamerTag, mainAgent, kdRatio, team } = req.body;

  if (!gamerTag || !mainAgent || !team) {
    throw new BadRequestError("Los campos gamerTag, mainAgent y team son obligatorios.");
  }

  const kd = Number(kdRatio);
  if (kdRatio === undefined || isNaN(kd) || kd < 0) {
    throw new BadRequestError("El campo kdRatio debe ser un número positivo.");
  }

  const newPlayer = await playersService.createPlayerService({
    gamerTag: gamerTag.trim(),
    mainAgent: mainAgent.trim(),
    kdRatio: kd,
    team: team.trim()
  });

  return res.status(201).json({ status: "success", data: newPlayer });
});