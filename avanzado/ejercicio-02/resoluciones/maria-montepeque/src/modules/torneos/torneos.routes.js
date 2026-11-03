import { Router } from "express";

export function crearTorneosRouter(controller) {
    const router = Router();
    router.get("/", controller.listar);
    router.post("/", controller.crear);
    router.get("/:id", controller.ver);
    router.post("/:id/inscripciones", controller.inscribir);
    return router;
}
