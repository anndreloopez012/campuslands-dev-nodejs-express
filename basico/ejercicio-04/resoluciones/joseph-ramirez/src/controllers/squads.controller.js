import { getSquadsData } from "../services/squads.service.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getSquads = (req, res) => {
  try {
    const squads = getSquadsData();

    return successResponse(res, {
      message: "Escuadrones obtenidos correctamente",
      topic: "modulos ES Modules",
      data: squads
    });
  } catch (error) {
    console.error("Error al obtener los escuadrones:", error.message);

    return errorResponse(res, "Error interno del servidor");
  }
};