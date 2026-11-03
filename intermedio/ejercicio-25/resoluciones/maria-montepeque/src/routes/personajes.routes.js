import { Router } from "express";
import { crearPersonajesController } from "../controllers/personajes.controller.js";
import requireGm from "../middlewares/gm.middleware.js";

function crearPersonajesRouter(service, tokenGm) {
    const router = Router();
    const controller = crearPersonajesController(service);

    router.get("/", controller.list);
    router.post("/", controller.create);
    router.get("/:id", controller.getOne);
    router.post("/:id/subir-nivel", controller.subirNivel);
    router.post("/:id/inventario", controller.agregarItem);
    router.delete("/:id", requireGm(tokenGm), controller.remove);

    return router;
}

export { crearPersonajesRouter };
