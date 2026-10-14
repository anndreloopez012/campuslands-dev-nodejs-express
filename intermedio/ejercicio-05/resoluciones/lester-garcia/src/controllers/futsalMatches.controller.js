import * as matchService from "../services/futsalMatches.service.js";
import { UnauthorizedError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const assertAuthorized = (req) => {
  const key = req.headers["x-league-key"];
  if (!key || key !== process.env.LEAGUE_ADMIN_KEY) {
    throw new UnauthorizedError("Se requiere clave válida en el header 'x-league-key'.");
  }
};

export const getMatchesController = asyncHandler(async (req, res) => {
  const matches = await matchService.getAllMatchesService(req.query);
  return res.status(200).json({ status: "success", total: matches.length, data: matches });
});

export const getMatchByIdController = asyncHandler(async (req, res) => {
  const match = await matchService.getMatchByIdService(req.params.id);
  return res.status(200).json({ status: "success", data: match });
});

export const createMatchController = asyncHandler(async (req, res) => {
  assertAuthorized(req);
  const newMatch = await matchService.createMatchService(req.body);
  return res.status(201).json({ status: "success", data: newMatch });
});

export const updateMatchController = asyncHandler(async (req, res) => {
  assertAuthorized(req);
  const updatedMatch = await matchService.updateMatchService(req.params.id, req.body);
  return res.status(200).json({ status: "success", data: updatedMatch });
});

export const deleteMatchController = asyncHandler(async (req, res) => {
  assertAuthorized(req);
  await matchService.deleteMatchService(req.params.id);
  return res.status(204).send();
});