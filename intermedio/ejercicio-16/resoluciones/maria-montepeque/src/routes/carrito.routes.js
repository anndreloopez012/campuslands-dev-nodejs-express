import { Router } from "express";
import { verCarrito, agregarItem, quitarItem } from "../controllers/carrito.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// pongo el middleware una vez y protege todas las rutas de abajo
router.use(requireAuth);

router.get("/", verCarrito);
router.post("/items", agregarItem);
router.delete("/items/:sneakerId", quitarItem);

export default router;
