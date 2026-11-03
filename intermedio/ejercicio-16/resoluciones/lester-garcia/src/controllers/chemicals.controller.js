import * as chemService from "../services/chemicals.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getChemicalsController = asyncHandler(async (req, res) => {
  const chemicals = await chemService.getAllChemicalsService(req.query.hazardLevel);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    total: chemicals.length,
    data: chemicals
  });
});

export const getChemicalByIdController = asyncHandler(async (req, res) => {
  const compound = await chemService.getChemicalByIdService(req.params.id);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: compound
  });
});

export const createChemicalController = asyncHandler(async (req, res) => {
  const newCompound = await chemService.createChemicalService(req.body, req.user);
  return res.status(201).json({
    status: "success",
    requestId: req.id,
    data: newCompound
  });
});

export const deleteChemicalController = asyncHandler(async (req, res) => {
  await chemService.deleteChemicalService(req.params.id);
  return res.status(204).send();
});