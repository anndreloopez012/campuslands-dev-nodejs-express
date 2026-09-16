import { createRouter, json } from "./core/http.js";
import { requestLogger } from "./middlewares/request-logger.js";
import { matchesRoutes } from "./routes/matches.routes.js";

const router = createRouter();

router.get("/health", (req, res) => {
    json(res, 200, { ok: true, message: "API MOBA esports activa" });
});

matchesRoutes(router);

async function handleRequest(req, res) {
    requestLogger(req, res);

    const handler = router.resolve(req);
    if (!handler) {
        return json(res, 404, { ok: false, message: `Ruta ${req.method} ${req.url} no encontrada` });
    }

    try {
        await handler(req, res);
    } catch (error) {
        const status = error.status ?? 500;
        if (status === 500) req.log.error(error.message, { stack: error.stack.split("\n")[1]?.trim() });
        json(res, status, { ok: false, message: status === 500 ? "Error interno del servidor" : error.message, reqId: req.id });
    }
}

export { handleRequest };
