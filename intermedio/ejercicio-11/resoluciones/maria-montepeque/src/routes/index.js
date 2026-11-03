import { Router } from "express";
import cancionesRoutes from "./canciones.routes.js";

const router = Router();

router.get("/", (req, res) => {
    res.json({ ok: true, resources: ["/api/canciones", "/api/canciones/buscar?q=texto"] });
});

router.use("/canciones", cancionesRoutes);

export default router;
