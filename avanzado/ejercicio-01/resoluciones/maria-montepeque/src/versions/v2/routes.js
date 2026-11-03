import express, { Router } from "express";
import * as v2 from "./controller.js";
import { versionHeader } from "../../middlewares/deprecacion.js";

const router = Router();

router.use(versionHeader("2"));
router.use(express.json());

router.get("/personajes", v2.listar);
router.post("/personajes", v2.crear);
router.get("/personajes/:id", v2.ver);
router.post("/personajes/:id/subir-nivel", v2.subirNivel);

// v2 usa el formato nuevo de errores: { ok, message, errors }
router.use((req, res) => {
    res.status(404).json({ ok: false, message: `La ruta ${req.method} ${req.originalUrl} no existe en v2` });
});

router.use((error, req, res, next) => {
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({ ok: false, message: "El body no es un JSON valido" });
    }
    if (error.statusCode) {
        const body = { ok: false, message: error.message };
        if (error.errors) body.errors = error.errors;
        return res.status(error.statusCode).json(body);
    }
    next(error);
});

export default router;
