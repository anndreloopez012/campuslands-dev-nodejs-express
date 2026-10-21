import * as starshipsService from "../services/starships.service.js";
import { UnauthorizedError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const assertAuthorized = (req) => {
  const key = req.headers["x-fleet-key"];
  if (!key || key !== process.env.FLEET_COMMAND_KEY) {
    throw new UnauthorizedError("Se requiere clave de almirante en 'x-fleet-key'.");
  }
};

export const getStarshipsController = asyncHandler(async (req, res) => {
  const ships = await starshipsService.getAllStarshipsService(req.query);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    total: ships.length,
    data: ships
  });
});

export const getStarshipByIdController = asyncHandler(async (req, res) => {
  const embedPlanet = req.query.embed === "planet";
  const ship = await starshipsService.getStarshipByIdService(req.params.id, embedPlanet);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: ship
  });
});

export const createStarshipController = asyncHandler(async (req, res) => {
  assertAuthorized(req);
  const newShip = await starshipsService.createStarshipService(req.body);
  return res.status(201).json({
    status: "success",
    requestId: req.id,
    data: newShip
  });
});

export const deleteStarshipController = asyncHandler(async (req, res) => {
  assertAuthorized(req);
  await starshipsService.deleteStarshipService(req.params.id);
  return res.status(204).send();
});