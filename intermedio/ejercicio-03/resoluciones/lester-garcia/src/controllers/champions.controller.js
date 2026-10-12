import * as championsService from "../services/champions.service.js";
import { UnauthorizedError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper para verificar cabecera de autorización de manera compacta
const assertAuthorized = (req) => {
  const key = req.headers["x-moba-key"];
  if (!key || key !== process.env.MOBA_ADMIN_KEY) {
    throw new UnauthorizedError("Se requiere clave de autorización en el header 'x-moba-key'.");
  }
};

export const getChampionsController = asyncHandler(async (req, res) => {
  const champions = await championsService.getAllChampionsService(req.query);
  return res.status(200).json({
    status: "success",
    total: champions.length,
    data: champions
  });
});

export const getChampionByIdController = asyncHandler(async (req, res) => {
  const champion = await championsService.getChampionByIdService(req.params.id);
  return res.status(200).json({
    status: "success",
    data: champion
  });
});

export const createChampionController = asyncHandler(async (req, res) => {
  assertAuthorized(req);
  const newChampion = await championsService.createChampionService(req.body);
  return res.status(201).json({
    status: "success",
    data: newChampion
  });
});

export const updateChampionController = asyncHandler(async (req, res) => {
  assertAuthorized(req);
  const updatedChampion = await championsService.updateChampionService(req.params.id, req.body);
  return res.status(200).json({
    status: "success",
    data: updatedChampion
  });
});

export const deleteChampionController = asyncHandler(async (req, res) => {
  assertAuthorized(req);
  await championsService.deleteChampionService(req.params.id);
  return res.status(204).send();
});