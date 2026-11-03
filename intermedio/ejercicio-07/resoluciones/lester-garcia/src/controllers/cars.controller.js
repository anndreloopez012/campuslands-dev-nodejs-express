import * as carService from "../services/cars.service.js";
import { UnauthorizedError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const assertAuthorized = (req) => {
  const key = req.headers["x-dealer-key"];
  if (!key || key !== process.env.DEALER_SECRET_KEY) {
    throw new UnauthorizedError("Se requiere llave de concesionario en el header 'x-dealer-key'.");
  }
};

export const getAllCarsController = asyncHandler(async (req, res) => {
  const cars = await carService.getAllCarsService(req.query);
  return res.status(200).json({ status: "success", total: cars.length, data: cars });
});

export const getCarByIdController = asyncHandler(async (req, res) => {
  const car = await carService.getCarByIdService(req.params.id);
  return res.status(200).json({ status: "success", data: car });
});

export const createCarController = asyncHandler(async (req, res) => {
  assertAuthorized(req);
  const newCar = await carService.registerCarService(req.body);
  return res.status(201).json({ status: "success", data: newCar });
});

export const deleteCarController = asyncHandler(async (req, res) => {
  assertAuthorized(req);
  await carService.deleteCarService(req.params.id);
  return res.status(204).send();
});

export const triggerCrashController = asyncHandler(async (req, res) => {
  // Endpoint de prueba para verificar cómo el errorHandler captura un 500
  await carService.simulateUnexpectedErrorService();
  return res.status(200).json({ message: "No se alcanzará este punto" });
});