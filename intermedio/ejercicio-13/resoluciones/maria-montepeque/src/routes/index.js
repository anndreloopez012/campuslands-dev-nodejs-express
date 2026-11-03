import { Router } from "express";
import navesRoutes from "./naves.routes.js";
import tripulantesRoutes from "./tripulantes.routes.js";

const router = Router();

router.get("/", (req, res) => {
    res.json({ ok: true, resources: ["/api/naves", "/api/tripulantes"] });
});

router.use("/naves", navesRoutes);
router.use("/tripulantes", tripulantesRoutes);

export default router;
