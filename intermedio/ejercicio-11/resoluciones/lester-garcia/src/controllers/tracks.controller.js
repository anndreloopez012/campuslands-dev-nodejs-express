import * as tracksService from "../services/tracks.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const searchTracksController = asyncHandler(async (req, res) => {
  const result = await tracksService.searchTracksService(req.query);

  return res.status(200).json({
    status: "success",
    requestId: req.id,
    search: result.searchMeta,
    pagination: result.pagination,
    data: result.tracks
  });
});

export const getTrackByIdController = asyncHandler(async (req, res) => {
  const track = await tracksService.getTrackByIdService(req.params.id);

  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: track
  });
});