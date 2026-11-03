import * as authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const registerController = asyncHandler(async (req, res) => {
  const result = await authService.registerSkydiverService(req.body);
  return res.status(201).json({
    status: "success",
    requestId: req.id,
    message: "Paracaidista registrado con contraseña hasheada y salt criptográfico.",
    data: result
  });
});

export const loginController = asyncHandler(async (req, res) => {
  const result = await authService.loginSkydiverService(req.body);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    message: "Acceso concedido a la Dropzone.",
    data: result
  });
});

export const getProfileController = asyncHandler(async (req, res) => {
  const profile = await authService.getProfileService(req.user.id);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: profile
  });
});