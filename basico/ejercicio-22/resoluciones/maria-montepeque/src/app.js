import { createRouter, json } from "./core/http.js";
import { estimatesRoutes } from "./routes/estimates.routes.js";

const router = createRouter();

router.get("/health", (req, res) => {
    json(res, 200, { ok: true, message: "API de arquitectura 3D activa" });
});

estimatesRoutes(router);

async function handleRequest(req, res) {
    const handler = router.resolve(req);

    if (!handler) {
        return json(res, 404, { ok: false, message: `Ruta ${req.method} ${req.url} no encontrada` });
    }

    try {
        await handler(req, res);
    } catch (error) {
        json(res, error.status ?? 500, { ok: false, error: error.name, message: error.message });
    }
}

export { handleRequest };
