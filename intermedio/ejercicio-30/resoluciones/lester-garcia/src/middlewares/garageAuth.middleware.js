import { config } from "../config/env.config.js";
import { UnauthorizedError } from "../utils/customErrors.js";

export const requireGarageApiKey = (req, res, next) => {
  const apiKey = req.headers["x-garage-key"];
  if (!apiKey || apiKey.trim() !== config.workshop.chiefMechanicApiKey) {
    return next(
      new UnauthorizedError("Se requiere el encabezado 'X-Garage-Key' válido del jefe de taller.")
    );
  }
  next();
};
