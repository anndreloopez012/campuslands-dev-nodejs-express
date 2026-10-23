import {
  getAllStreetFoodService,
  getStreetFoodByIdService,
  createStreetFoodService
} from "../services/streetFood.service.js";
import { parseJsonBody, sendJsonResponse } from "../utils/bodyParser.js";

export const getStreetFoodController = async (req, res) => {
  try {
    const foods = await getAllStreetFoodService();
    sendJsonResponse(res, 200, {
      status: "success",
      total: foods.length,
      data: foods
    });
  } catch (error) {
    sendJsonResponse(res, 500, {
      status: "error",
      message: "Error al recuperar el menú de comida urbana."
    });
  }
};

export const getStreetFoodByIdController = async (req, res, id) => {
  try {
    const item = await getStreetFoodByIdService(id);

    if (!item) {
      return sendJsonResponse(res, 404, {
        status: "fail",
        message: `El platillo con ID '${id}' no existe en el puesto.`
      });
    }

    sendJsonResponse(res, 200, {
      status: "success",
      data: item
    });
  } catch (error) {
    sendJsonResponse(res, 500, {
      status: "error",
      message: "Error interno al buscar el platillo."
    });
  }
};

export const createStreetFoodController = async (req, res) => {
  try {
    const body = await parseJsonBody(req);
    const { name, category, price, spicyLevel, available } = body;

    // Validaciones básicas de entrada
    if (!name || typeof name !== "string" || name.trim() === "") {
      return sendJsonResponse(res, 400, {
        status: "fail",
        message: "El campo 'name' es obligatorio y debe ser un texto válido."
      });
    }

    if (!category || typeof category !== "string" || category.trim() === "") {
      return sendJsonResponse(res, 400, {
        status: "fail",
        message: "El campo 'category' es obligatorio y debe ser un texto válido."
      });
    }

    const numericPrice = Number(price);
    if (price === undefined || isNaN(numericPrice) || numericPrice <= 0) {
      return sendJsonResponse(res, 400, {
        status: "fail",
        message: "El campo 'price' debe ser un número mayor a 0."
      });
    }

    const numericSpicy = Number(spicyLevel);
    if (spicyLevel === undefined || isNaN(numericSpicy) || numericSpicy < 0 || numericSpicy > 5) {
      return sendJsonResponse(res, 400, {
        status: "fail",
        message: "El campo 'spicyLevel' debe ser un entero entre 0 y 5."
      });
    }

    const newItem = await createStreetFoodService({
      name: name.trim(),
      category: category.trim(),
      price: numericPrice,
      spicyLevel: numericSpicy,
      available
    });

    sendJsonResponse(res, 201, {
      status: "success",
      data: newItem
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJsonResponse(res, statusCode, {
      status: statusCode >= 500 ? "error" : "fail",
      message: error.message || "Error al procesar la solicitud."
    });
  }
};