import * as tattoosService from "../services/tattoos.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getStudioConfigController = asyncHandler(async (req, res) => {
  const studioConfig = tattoosService.getStudioConfigService();
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: studioConfig
  });
});

export const getAllTattoosController = asyncHandler(async (req, res) => {
  const sessions = await tattoosService.getAllTattoosService();
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    total: sessions.length,
    data: sessions
  });
});

export const getTattooByIdController = asyncHandler(async (req, res) => {
  const session = await tattoosService.getTattooByIdService(req.params.id);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: session
  });
});

export const createTattooController = asyncHandler(async (req, res) => {
  const newSession = await tattoosService.createTattooService(req.body);
  return res.status(201).json({
    status: "success",
    requestId: req.id,
    message: "Sesión de tatuaje registrada y cotizada según la configuración del estudio.",
    data: newSession
  });
});
