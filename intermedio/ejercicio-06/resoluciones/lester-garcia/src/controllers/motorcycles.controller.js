import * as motoService from "../services/motorcycles.service.js";
import { UnauthorizedError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const assertAuthorized = (req) => {
  const key = req.headers["x-workshop-key"];
  if (!key || key !== process.env.WORKSHOP_KEY) {
    throw new UnauthorizedError("Se requiere clave válida en el header 'x-workshop-key'.");
  }
};

export const getAllBikesController = asyncHandler(async (req, res) => {
  const bikes = await motoService.getAllMotorcyclesService(req.query);
  return res.status(200).json({ status: "success", total: bikes.length, data: bikes });
});

export const getBikeByIdController = asyncHandler(async (req, res) => {
  const bike = await motoService.getMotorcycleByIdService(req.params.id);
  return res.status(200).json({ status: "success", data: bike });
});

export const createBikeController = asyncHandler(async (req, res) => {
  assertAuthorized(req);
  const newBike = await motoService.registerMotorcycleService(req.body);
  return res.status(201).json({ status: "success", data: newBike });
});

export const updateBikeStatusController = asyncHandler(async (req, res) => {
  assertAuthorized(req);
  const updated = await motoService.updateMotorcycleStatusService(req.params.id, req.body.currentStatus);
  return res.status(200).json({ status: "success", data: updated });
});

export const deleteBikeController = asyncHandler(async (req, res) => {
  assertAuthorized(req);
  await motoService.deleteMotorcycleService(req.params.id);
  return res.status(204).send();
});