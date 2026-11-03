import * as brService from "../services/battleRoyale.service.js";
import { UnauthorizedError, BadRequestError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const assertAuthorized = (req) => {
  const key = req.headers["x-br-key"];
  if (!key || key !== process.env.BR_ADMIN_KEY) {
    throw new UnauthorizedError("Se requiere clave en el encabezado 'x-br-key'.");
  }
};

export const getLobbiesController = asyncHandler(async (req, res) => {
  const lobbies = await brService.getAllLobbiesService(req.query);
  return res.status(200).json({ status: "success", total: lobbies.length, data: lobbies });
});

export const getLobbyByIdController = asyncHandler(async (req, res) => {
  const lobby = await brService.getLobbyByIdService(req.params.id);
  return res.status(200).json({ status: "success", data: lobby });
});

export const createLobbyController = asyncHandler(async (req, res) => {
  assertAuthorized(req);
  const newLobby = await brService.createLobbyService(req.body);
  return res.status(201).json({ status: "success", data: newLobby });
});

export const joinLobbyController = asyncHandler(async (req, res) => {
  const { playerId } = req.body;
  if (!playerId) {
    throw new BadRequestError("El campo 'playerId' es obligatorio para unirse al lobby.");
  }

  const result = await brService.joinLobbyService(req.params.id, playerId);
  return res.status(200).json({ status: "success", data: result });
});