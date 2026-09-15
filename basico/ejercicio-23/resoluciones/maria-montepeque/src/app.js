import { createRouter, json } from "./core/http.js";
import { electrodesRoutes } from "./routes/electrodes.routes.js";

const router = createRouter();

router.get("/health", (req, res) => {
    json(res, 200, { ok: true, message: "API de inventario de soldadura activa" });
});

electrodesRoutes(router);

async function handleRequest(req, res) {
    const { handler, pathExists } = router.resolve(req);

    if (!handler) {
        return pathExists
            ? json(res, 405, { ok: false, message: `Metodo ${req.method} no permitido` })
            : json(res, 404, { ok: false, message: `Ruta ${req.url} no encontrada` });
    }

    try {
        await handler(req, res);
    } catch (error) {
        json(res, error.status ?? 500, { ok: false, message: error.message });
    }
}

export { handleRequest };
