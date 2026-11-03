import * as jumpsService from "../services/jumps.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMyJumpsController = asyncHandler(async (req, res) => {
  const jumps = await jumpsService.getJumpsService(req.user);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    total: jumps.length,
    data: jumps
  });
});

export const logJumpController = asyncHandler(async (req, res) => {
  const newJump = await jumpsService.logNewJumpService(req.body, req.user);
  return res.status(201).json({
    status: "success",
    requestId: req.id,
    data: newJump
  });
});