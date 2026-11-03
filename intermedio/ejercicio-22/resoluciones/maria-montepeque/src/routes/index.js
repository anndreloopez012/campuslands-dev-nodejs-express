import { Router } from "express";
import { subirArchivos } from "../middlewares/upload.middleware.js";
import {
    listProyectos,
    subir,
    listArchivos,
    verInfo,
    descargar,
    borrar
} from "../controllers/archivos.controller.js";

const router = Router();

router.get("/", (req, res) => {
    res.json({ ok: true, resources: ["/api/proyectos", "/api/proyectos/:id/archivos", "/api/archivos/:id"] });
});

router.get("/proyectos", listProyectos);
// subirArchivos es el middleware de multer, va antes del controlador
router.post("/proyectos/:id/archivos", subirArchivos, subir);
router.get("/proyectos/:id/archivos", listArchivos);

router.get("/archivos/:id", verInfo);
router.get("/archivos/:id/descarga", descargar);
router.delete("/archivos/:id", borrar);

export default router;
