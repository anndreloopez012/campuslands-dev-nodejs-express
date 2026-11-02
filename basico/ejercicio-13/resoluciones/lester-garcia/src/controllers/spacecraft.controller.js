import {
  getAllSpacecraftsService,
  getSpacecraftByIdService,
  createSpacecraftService
} from "../services/spacecraft.service.js";
import { BadRequestError } from "../utils/customErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getSpacecraftsController = asyncHandler(async (req, res) => {
  const crafts = await getAllSpacecraftsService();
  return res.status(200).json({
    status: "success",
    total: crafts.length,
    data: crafts
  });
});

export const getSpacecraftByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const craft = await getSpacecraftByIdService(id);

  return res.status(200).json({
    status: "success",
    data: craft
  });
});

export const createSpacecraftController = asyncHandler(async (req, res) => {
  const { name, class: craftClass, warpCapable, crewCapacity, status } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new BadRequestError("El parámetro 'name' es obligatorio y debe ser un texto válido.");
  }

  if (!craftClass || typeof craftClass !== "string" || craftClass.trim() === "") {
    throw new BadRequestError("El parámetro 'class' es obligatorio y debe ser un texto válido.");
  }

  if (warpCapable === undefined || typeof warpCapable !== "boolean") {
    throw new BadRequestError("El parámetro 'warpCapable' es obligatorio y debe ser booleano (true/false).");
  }

  const numericCapacity = Number(crewCapacity);
  if (crewCapacity === undefined || isNaN(numericCapacity) || numericCapacity <= 0) {
    throw new BadRequestError("El parámetro 'crewCapacity' debe ser un número entero positivo.");
  }

  const newCraft = await createSpacecraftService({
    name: name.trim(),
    craftClass: craftClass.trim(),
    warpCapable,
    crewCapacity: numericCapacity,
    status
  });

  return res.status(201).json({
    status: "success",
    data: newCraft
  });
});