import * as planetsService from "../services/planets.service.js";
import { UnauthorizedError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const assertAuthorized = (req) => {
  const key = req.headers["x-fleet-key"];
  if (!key || key !== process.env.FLEET_COMMAND_KEY) {
    throw new UnauthorizedError("Se requiere clave de almirante en 'x-fleet-key'.");
  }
};

export const getPlanetsController = asyncHandler(async (req, res) => {
  const planets = await planetsService.getAllPlanetsService();
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    total: planets.length,
    data: planets
  });
});

export const getPlanetByIdController = asyncHandler(async (req, res) => {
  const planet = await planetsService.getPlanetByIdService(req.params.id);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: planet
  });
});

export const deletePlanetController = asyncHandler(async (req, res) => {
  assertAuthorized(req);
  await planetsService.deletePlanetService(req.params.id);
  return res.status(204).send();
});