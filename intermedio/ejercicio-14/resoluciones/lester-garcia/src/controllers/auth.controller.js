import * as authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const loginController = asyncHandler(async (req, res) => {
  const result = await authService.loginService(req.body);

  return res.status(200).json({
    status: "success",
    requestId: req.id,
    message: "Sesión iniciada exitosamente.",
    data: result
  });
});

export const getProfileController = asyncHandler(async (req, res) => {
  // req.user fue inyectado previamente por authenticate.middleware
  const profile = await authService.getSessionProfileService(req.user.id);

  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: profile
  });
});