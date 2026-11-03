import { Router } from "express";

// antes las rutas y la logica estaban mezcladas, ahora aqui solo se ve el mapa de la API
export function crearRutas({ equipos, partidos }) {
    const router = Router();

    router.get("/equipos", equipos.listar);
    router.post("/equipos", equipos.crear);
    router.get("/equipos/:id", equipos.ver);
    router.put("/equipos/:id", equipos.editar);
    router.delete("/equipos/:id", equipos.borrar);

    router.get("/partidos", partidos.listar);
    router.post("/partidos", partidos.registrar);

    router.get("/tabla", partidos.tabla);

    return router;
}
