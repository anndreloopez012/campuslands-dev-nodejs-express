import * as authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const loginController = asyncHandler(async (req, res) => {
  const result = await authService.loginService(req.body);

  return res.status(200).json({
    status: "success",
    requestId: req.id,
    message: "Autenticación exitosa en el laboratorio químico.",
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