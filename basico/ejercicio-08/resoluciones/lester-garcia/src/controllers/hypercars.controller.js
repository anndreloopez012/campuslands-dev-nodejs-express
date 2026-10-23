import { getHypercarsService, getTelemetryService } from "../services/hypercars.service.js";
import { envConfig } from "../config/env.config.js";

export const getHypercarsController = (req, res) => {
  const cars = getHypercarsService();
  return res.status(200).json({
    status: "success",
    environment: envConfig.nodeEnv,
    total: cars.length,
    data: cars
  });
};

export const getTelemetryController = (req, res) => {
  const clientKey = req.headers["x-api-key"];

  if (!clientKey || clientKey !== envConfig.apiSecretKey) {
    return res.status(401).json({
      status: "error",
      message: "Acceso no autorizado: X-API-KEY no válida o ausente."
    });
  }

  const { id } = req.params;
  const telemetryData = getTelemetryService(id);

  if (!telemetryData) {
    return res.status(404).json({
      status: "error",
      message: "Hiperdeportivo no encontrado."
    });
  }

  return res.status(200).json({
    status: "success",
    data: telemetryData
  });
};