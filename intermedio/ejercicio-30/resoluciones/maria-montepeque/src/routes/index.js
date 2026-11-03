import { Router } from "express";
import authRoutes from "./auth.routes.js";
import motosRoutes from "./motos.routes.js";
import ordenesRoutes from "./ordenes.routes.js";
import repuestosRoutes from "./repuestos.routes.js";

// un router por recurso (ejercicio 02)
const router = Router();

router.use("/auth", authRoutes);
router.use("/motos", motosRoutes);
router.use("/ordenes", ordenesRoutes);
router.use("/repuestos", repuestosRoutes);

export default router;
