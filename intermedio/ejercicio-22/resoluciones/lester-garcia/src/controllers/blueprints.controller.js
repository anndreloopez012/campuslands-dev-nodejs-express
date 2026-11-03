import * as blueprintsService from "../services/blueprints.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllBlueprintsController = asyncHandler(async (req, res) => {
  const items = await blueprintsService.getAllBlueprintsService();
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    total: items.length,
    data: items
  });
});

export const getBlueprintByIdController = asyncHandler(async (req, res) => {
  const item = await blueprintsService.getBlueprintByIdService(req.params.id);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: item
  });
});

export const uploadBlueprintController = asyncHandler(async (req, res) => {
  const created = await blueprintsService.uploadBlueprintService(req.body, req.uploadedFile);
  return res.status(201).json({
    status: "success",
    requestId: req.id,
    message: "Modelo arquitectónico 3D procesado y almacenado exitosamente en el bucket BIM.",
    data: created
  });
});
