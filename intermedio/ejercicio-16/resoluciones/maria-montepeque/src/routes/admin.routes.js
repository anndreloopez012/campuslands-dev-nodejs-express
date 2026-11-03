import { Router } from "express";
import { createSneaker, updateStock } from "../controllers/sneakers.controller.js";
import { verTodos } from "../controllers/carrito.controller.js";
import { requireAuth, requireRol } from "../middlewares/auth.middleware.js";

const router = Router();

// primero login, despues que sea admin
router.use(requireAuth, requireRol("admin"));

router.post("/sneakers", createSneaker);
router.patch("/sneakers/:id/stock", updateStock);
router.get("/carritos", verTodos);

export default router;
