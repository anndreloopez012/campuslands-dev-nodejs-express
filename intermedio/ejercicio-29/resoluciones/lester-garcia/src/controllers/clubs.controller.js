import * as clubsService from "../services/clubs.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getStandingsController = asyncHandler(async (req, res) => {
  const standings = await clubsService.getStandingsTableService(req.query.modality);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    total: standings.length,
    data: standings
  });
});

export const getClubByIdController = asyncHandler(async (req, res) => {
  const club = await clubsService.getClubByIdService(req.params.id);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: club
  });
});

export const registerClubController = asyncHandler(async (req, res) => {
  const created = await clubsService.registerClubService(req.body);
  return res.status(201).json({
    status: "success",
    requestId: req.id,
    message: "Club inscrito y posicionado en la clasificación general.",
    data: created
  });
});
