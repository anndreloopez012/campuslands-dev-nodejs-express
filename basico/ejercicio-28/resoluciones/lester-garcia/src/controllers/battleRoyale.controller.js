import {
  getAllLobbiesService,
  getLobbyByIdService,
  createLobbyService
} from "../services/battleRoyale.service.js";
import { BadRequestError, UnauthorizedError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const VALID_MODES = ["Solo", "Duo", "Squad"];

export const getLobbiesController = asyncHandler(async (req, res) => {
  const { gameMode, isServerActive, mapName } = req.query;

  const lobbies = await getAllLobbiesService({ gameMode, isServerActive, mapName });

  return res.status(200).json({
    status: "success",
    environment: process.env.NODE_ENV || "development",
    total: lobbies.length,
    data: lobbies
  });
});

export const getLobbyByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lobby = await getLobbyByIdService(id);

  return res.status(200).json({
    status: "success",
    data: lobby
  });
});

export const createLobbyController = asyncHandler(async (req, res) => {
  // Validación de seguridad utilizando variable de entorno SECRET_MATCH_KEY
  const clientSecret = req.headers["x-server-secret"];
  if (!clientSecret || clientSecret !== process.env.SECRET_MATCH_KEY) {
    throw new UnauthorizedError("Credencial de servidor inválida o ausente en el header 'x-server-secret'.");
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new BadRequestError("El cuerpo de la petición no puede estar vacío.");
  }

  const { lobbyCode, mapName, maxPlayers, currentPlayers, gameMode, isServerActive } = req.body;

  if (!lobbyCode || typeof lobbyCode !== "string" || lobbyCode.trim() === "") {
    throw new BadRequestError("El campo 'lobbyCode' es obligatorio.");
  }

  if (!mapName || typeof mapName !== "string" || mapName.trim() === "") {
    throw new BadRequestError("El campo 'mapName' es obligatorio.");
  }

  if (!gameMode || !VALID_MODES.includes(gameMode.trim())) {
    throw new BadRequestError(`El campo 'gameMode' debe ser uno de: ${VALID_MODES.join(", ")}.`);
  }

  const maxP = Number(maxPlayers);
  if (maxPlayers === undefined || isNaN(maxP) || maxP <= 0) {
    throw new BadRequestError("El campo 'maxPlayers' debe ser un número entero mayor a 0.");
  }

  const newLobby = await createLobbyService({
    lobbyCode: lobbyCode.trim(),
    mapName: mapName.trim(),
    maxPlayers: maxP,
    currentPlayers,
    gameMode: gameMode.trim(),
    isServerActive
  });

  return res.status(201).json({
    status: "success",
    environment: process.env.NODE_ENV,
    data: newLobby
  });
});