import { Router } from "express";
import authRoutes from "./auth.routes.js";
import toursRoutes from "./tours.routes.js";
import reservasRoutes from "./reservas.routes.js";
import { PERMISOS_POR_ROL } from "../config/permisos.js";

const router = Router();

router.get("/", (req, res) => {
    res.json({ ok: true, resources: ["/api/auth", "/api/tours", "/api/reservas", "/api/roles"] });
});

// tabla publica de que puede hacer cada rol
router.get("/roles", (req, res) => {
    res.json({ ok: true, data: PERMISOS_POR_ROL });
});

router.use("/auth", authRoutes);
router.use("/tours", toursRoutes);
router.use("/reservas", reservasRoutes);

export default router;
