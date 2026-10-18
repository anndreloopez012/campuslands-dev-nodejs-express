import * as fightersService from "../services/fighters.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getFightersController = asyncHandler(async (req, res) => {
  const { fighters, pagination } = await fightersService.getFightersService(req.query);

  return res.status(200).json({
    status: "success",
    requestId: req.id,
    pagination,
    data: fighters
  });
});

export const getFighterByIdController = asyncHandler(async (req, res) => {
  const fighter = await fightersService.getFighterByIdService(req.params.id);

  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: fighter
  });
});