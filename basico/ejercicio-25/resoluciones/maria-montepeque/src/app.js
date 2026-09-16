import { randomUUID } from "node:crypto";
import { createRouter } from "./core/router.js";
import { ok, problem } from "./core/reply.js";
import { HttpError } from "./core/body.js";
import { heroesRoutes } from "./routes/heroes.routes.js";

const router = createRouter();

router.get("/health", (req, res) => {
    ok(req, res, 200, { ok: true, message: "API RPG activa" }, { "Cache-Control": "no-store" });
});

heroesRoutes(router);

function acceptsJson(req) {
    const accept = req.headers.accept ?? "*/*";
    return ["*/*", "application/*", "application/json", "application/problem+json"].some((type) => accept.includes(type));
}

async function handleRequest(req, res) {
    req.id = randomUUID();

    if (!acceptsJson(req)) {
        return problem(req, res, 406, "Esta API solo produce application/json");
    }

    const { handler, allowed } = router.resolve(req);

    if (!handler) {
        return allowed.length > 0
            ? problem(req, res, 405, `${req.method} no esta permitido en ${req.url}`, { allowed }, { Allow: allowed.join(", ") })
            : problem(req, res, 404, `La ruta ${req.url} no existe`);
    }

    try {
        await handler(req, res);
    } catch (error) {
        const status = error instanceof HttpError ? error.status : 500;
        if (status === 500) console.error(`[${req.id}]`, error);
        problem(req, res, status, status === 500 ? "Error inesperado, revisa el X-Request-Id en los logs" : error.message, error.extra);
    }
}

export { handleRequest };
