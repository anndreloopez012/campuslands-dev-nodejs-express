import * as illustrationsService from "../services/illustrations.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCorsPolicyController = asyncHandler(async (req, res) => {
  const policy = illustrationsService.getCorsPolicyService();
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    requestOrigin: req.headers.origin || "direct-client",
    data: policy
  });
});

export const getAllIllustrationsController = asyncHandler(async (req, res) => {
  const items = await illustrationsService.getAllIllustrationsService();
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    total: items.length,
    data: items
  });
});

export const getIllustrationByIdController = asyncHandler(async (req, res) => {
  const item = await illustrationsService.getIllustrationByIdService(req.params.id);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: item
  });
});

export const createIllustrationController = asyncHandler(async (req, res) => {
  const created = await illustrationsService.createIllustrationService(req.body);
  return res.status(201).json({
    status: "success",
    requestId: req.id,
    message: "Ilustración digital publicada exitosamente en el portafolio.",
    data: created
  });
});
