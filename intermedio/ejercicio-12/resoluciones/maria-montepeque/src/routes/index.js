import { Router } from "express";
import peliculasRoutes from "./peliculas.routes.js";

const router = Router();

router.get("/", (req, res) => {
    res.json({ ok: true, resources: ["/api/peliculas", "/api/peliculas/:peliculaId/resenas"] });
});

router.use("/peliculas", peliculasRoutes);

export default router;
