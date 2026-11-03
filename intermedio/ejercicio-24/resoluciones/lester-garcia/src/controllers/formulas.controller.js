import * as formulasService from "../services/formulas.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllFormulasController = asyncHandler(async (req, res) => {
  const items = await formulasService.getAllFormulasService();
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    total: items.length,
    data: items
  });
});

export const getFormulaByIdController = asyncHandler(async (req, res) => {
  const item = await formulasService.getFormulaByIdService(req.params.id);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: item
  });
});

export const createFormulaController = asyncHandler(async (req, res) => {
  const created = await formulasService.createFormulaService(req.body);
  return res.status(201).json({
    status: "success",
    requestId: req.id,
    message: "Fórmula química sintetizada y clasificada exitosamente.",
    data: created
  });
});
