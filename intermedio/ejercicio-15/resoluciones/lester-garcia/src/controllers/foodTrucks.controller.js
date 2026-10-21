import * as trucksService from "../services/foodTrucks.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getFoodTrucksController = asyncHandler(async (req, res) => {
  const trucks = await trucksService.getAllFoodTrucksService(req.query.specialty);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    total: trucks.length,
    data: trucks
  });
});

export const getFoodTruckByIdController = asyncHandler(async (req, res) => {
  const truck = await trucksService.getFoodTruckByIdService(req.params.id);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: truck
  });
});

export const createFoodTruckController = asyncHandler(async (req, res) => {
  const newTruck = await trucksService.createFoodTruckService(req.body, req.user);
  return res.status(201).json({
    status: "success",
    requestId: req.id,
    data: newTruck
  });
});

export const deleteFoodTruckController = asyncHandler(async (req, res) => {
  await trucksService.deleteFoodTruckService(req.params.id, req.user);
  return res.status(204).send();
});