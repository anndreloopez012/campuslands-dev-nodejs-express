import * as tournamentsService from "../services/tournaments.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getOpenApiDocsController = asyncHandler(async (req, res) => {
  const spec = tournamentsService.getOpenApiDocsService();
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: spec
  });
});

export const getAllTournamentsController = asyncHandler(async (req, res) => {
  const items = await tournamentsService.getAllTournamentsService();
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    total: items.length,
    data: items
  });
});

export const getTournamentByIdController = asyncHandler(async (req, res) => {
  const item = await tournamentsService.getTournamentByIdService(req.params.id);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: item
  });
});

export const createTournamentController = asyncHandler(async (req, res) => {
  const created = await tournamentsService.createTournamentService(req.body);
  return res.status(201).json({
    status: "success",
    requestId: req.id,
    message: "Torneo oficial de MOBA Esports registrado.",
    data: created
  });
});
