import express, { Router } from "express";
import * as v1 from "./controller.js";
import { marcarDeprecada, versionHeader } from "../../middlewares/deprecacion.js";

// fecha en la que se apaga la v1
export const SUNSET_V1 = "2027-06-30T00:00:00Z";

const router = Router();

router.use(versionHeader("1"));
router.use(marcarDeprecada({ sunset: SUNSET_V1, sucesora: "/api/v2" }));
router.use(express.json());

router.get("/personajes", v1.listar);
router.post("/personajes", v1.crear);
router.get("/personajes/:id", v1.ver);

// la v1 tenia sus errores como { error: "..." }, no los cambio para no romper a nadie
router.use((req, res) => {
    res.status(404).json({ error: `La ruta ${req.method} ${req.originalUrl} no existe en v1` });
});

router.use((error, req, res, next) => {
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({ error: "JSON invalido" });
    }
    if (error.statusCode) {
        return res.status(error.statusCode).json({ error: error.message });
    }
    next(error);
});

export default router;
