import * as matchesService from "../services/matches.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllMatchesController = asyncHandler(async (req, res) => {
  const items = await matchesService.getAllMatchesService();
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    total: items.length,
    data: items
  });
});

export const getMatchByIdController = asyncHandler(async (req, res) => {
  const item = await matchesService.getMatchByIdService(req.params.id);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: item
  });
});

export const registerMatchController = asyncHandler(async (req, res) => {
  const created = await matchesService.registerCompetitiveMatchService(req.body);
  return res.status(201).json({
    status: "success",
    requestId: req.id,
    message: "Partida competitiva verificada por Anticheat y registrada.",
    data: created
  });
});
