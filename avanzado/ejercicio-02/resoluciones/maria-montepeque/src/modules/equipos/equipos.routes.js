import { Router } from "express";

export function crearEquiposRouter(controller) {
    const router = Router();
    router.get("/", controller.listar);
    router.post("/", controller.crear);
    router.get("/:id", controller.ver);
    return router;
}
