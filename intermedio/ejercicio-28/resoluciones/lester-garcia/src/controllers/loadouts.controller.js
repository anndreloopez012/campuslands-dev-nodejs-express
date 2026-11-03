import * as loadoutsService from "../services/loadouts.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getHttpExamplesController = asyncHandler(async (req, res) => {
  const examples = loadoutsService.getHttpExamplesCollectionService();
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    totalExamples: examples.length,
    data: examples
  });
});

export const getAllLoadoutsController = asyncHandler(async (req, res) => {
  const items = await loadoutsService.getAllLoadoutsService();
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    total: items.length,
    data: items
  });
});

export const getLoadoutByIdController = asyncHandler(async (req, res) => {
  const item = await loadoutsService.getLoadoutByIdService(req.params.id);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: item
  });
});

export const createLoadoutController = asyncHandler(async (req, res) => {
  const created = await loadoutsService.createLoadoutService(req.body);
  return res.status(201).json({
    status: "success",
    requestId: req.id,
    message: "Equipamiento de Battle Royale desplegado en el mapa.",
    data: created
  });
});
