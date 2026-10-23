import {
  getStreetFoodController,
  getStreetFoodByIdController,
  createStreetFoodController
} from "../controllers/streetFood.controller.js";
import { sendJsonResponse } from "../utils/bodyParser.js";

export const handleRoutes = async (req, res) => {
  const host = req.headers.host || "localhost:3000";
  const parsedUrl = new URL(req.url, `http://${host}`);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  // Route 1: GET /api/v1/street-food
  if (method === "GET" && pathname === "/api/v1/street-food") {
    return await getStreetFoodController(req, res);
  }

  // Route 2: GET /api/v1/street-food/:id
  const matchId = pathname.match(/^\/api\/v1\/street-food\/([a-zA-Z0-9]+)$/);
  if (method === "GET" && matchId) {
    const id = matchId[1];
    return await getStreetFoodByIdController(req, res, id);
  }

  // Route 3: POST /api/v1/street-food
  if (method === "POST" && pathname === "/api/v1/street-food") {
    return await createStreetFoodController(req, res);
  }

  // Route 404: Not Found
  sendJsonResponse(res, 404, {
    status: "fail",
    message: `Ruta no encontrada: ${method} ${pathname}`
  });
};