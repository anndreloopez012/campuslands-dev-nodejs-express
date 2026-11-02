import {
  getAllMatchesService,
  getMatchByIdService,
  createMatchService,
  deleteMatchService
} from "../services/matches.service.js";
import { BadRequestError, UnauthorizedError, ForbiddenError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const VALID_GAME_MODES = ["Competitive", "Premier", "Ranked Leagues", "Deathmatch", "Casual"];

export const getAllMatchesController = asyncHandler(async (req, res) => {
  const { gameMode, isTournamentMatch, mapName } = req.query;

  const matches = await getAllMatchesService({ gameMode, isTournamentMatch, mapName });

  // 200 OK para lectura exitosa de colecciones
  return res.status(200).json({
    status: "success",
    total: matches.length,
    data: matches
  });
});

export const getMatchByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const match = await getMatchByIdService(id);

  // 200 OK para lectura exitosa por ID
  return res.status(200).json({
    status: "success",
    data: match
  });
});

export const createMatchController = asyncHandler(async (req, res) => {
  // Simulación de control de autenticación mediante headers simulados (X-API-Key o Bearer)
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new UnauthorizedError("Falta el token de autorización o credenciales de API.");
  }

  // Simulación de control de roles (Ej: solo los tokens con rol 'admin' pueden registrar partidas)
  if (authHeader !== "Bearer secret-admin-token-2026") {
    throw new ForbiddenError("No tienes privilegios suficientes para registrar partidas oficiales de esports.");
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new BadRequestError("El cuerpo de la petición no puede estar vacío.");
  }

  const { matchCode, mapName, gameMode, winningTeam, score, durationMinutes, mvpPlayer, isTournamentMatch } = req.body;

  if (!matchCode || typeof matchCode !== "string" || matchCode.trim() === "") {
    throw new BadRequestError("El campo 'matchCode' es obligatorio.");
  }

  if (!mapName || typeof mapName !== "string" || mapName.trim() === "") {
    throw new BadRequestError("El campo 'mapName' (mapa) es obligatorio.");
  }

  if (!gameMode || !VALID_GAME_MODES.includes(gameMode.trim())) {
    throw new BadRequestError(`El campo 'gameMode' debe ser uno de: ${VALID_GAME_MODES.join(", ")}.`);
  }

  if (!winningTeam || typeof winningTeam !== "string" || winningTeam.trim() === "") {
    throw new BadRequestError("El campo 'winningTeam' es obligatorio.");
  }

  if (!score || typeof score !== "string" || score.trim() === "") {
    throw new BadRequestError("El campo 'score' (marcador) es obligatorio.");
  }

  const duration = Number(durationMinutes);
  if (durationMinutes === undefined || isNaN(duration) || duration <= 0) {
    throw new BadRequestError("El campo 'durationMinutes' debe ser un número entero mayor a 0.");
  }

  if (!mvpPlayer || typeof mvpPlayer !== "string" || mvpPlayer.trim() === "") {
    throw new BadRequestError("El campo 'mvpPlayer' es obligatorio.");
  }

  const newMatch = await createMatchService({
    matchCode: matchCode.trim(),
    mapName: mapName.trim(),
    gameMode: gameMode.trim(),
    winningTeam: winningTeam.trim(),
    score: score.trim(),
    durationMinutes: duration,
    mvpPlayer: mvpPlayer.trim(),
    isTournamentMatch
  });

  // 201 Created para creación exitosa
  return res.status(201).json({
    status: "success",
    data: newMatch
  });
});

export const deleteMatchController = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new UnauthorizedError("Se requiere autenticación para eliminar registros de partidas.");
  }

  if (authHeader !== "Bearer secret-admin-token-2026") {
    throw new ForbiddenError("Acceso denegado. Se requiere rol de administrador para borrar datos de torneos.");
  }

  const { id } = req.params;
  await deleteMatchService(id);

  // 204 No Content para eliminación exitosa sin cuerpo de retorno
  return res.status(204).send();
});