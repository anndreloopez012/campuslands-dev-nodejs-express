import * as weldsService from "../services/welds.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllWeldsController = asyncHandler(async (req, res) => {
  const items = await weldsService.getAllWeldsService();
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    total: items.length,
    data: items
  });
});

export const getWeldByIdController = asyncHandler(async (req, res) => {
  const item = await weldsService.getWeldByIdService(req.params.id);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: item
  });
});

export const createWeldController = asyncHandler(async (req, res) => {
  const created = await weldsService.createWeldService(req.body);
  return res.status(201).json({
    status: "success",
    requestId: req.id,
    message: "Inspección de cordón de soldadura registrada exitosamente.",
    data: created
  });
});
