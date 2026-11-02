import * as playersService from "../services/players.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getPlayersController = asyncHandler(async (req, res) => {
  const result = await playersService.getPlayersService(req.query);

  return res.status(200).json({
    status: "success",
    requestId: req.id,
    sort: result.sortApplied,
    pagination: result.pagination,
    data: result.players
  });
});

export const getPlayerByIdController = asyncHandler(async (req, res) => {
  const player = await playersService.getPlayerByIdService(req.params.id);

  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: player
  });
});