import { createRouter, json, HttpError } from "./core/http.js";
import { leagueRoutes } from "./routes/league.routes.js";

const router = createRouter();

router.get("/health", (req, res) => {
    json(res, 200, { ok: true, service: "liga-barrio-api", version: "1.0.0" });
});

leagueRoutes(router);

async function handleRequest(req, res) {
    try {
        const { handler, allowed } = router.resolve(req);

        if (!handler) {
            if (allowed.length > 0) throw new HttpError(405, `Metodo ${req.method} no permitido`, { allowed });
            throw new HttpError(404, `Ruta ${req.url} no encontrada`);
        }

        await handler(req, res);
    } catch (error) {
        const status = error instanceof HttpError ? error.status : 500;
        if (status === 500) console.error(error);

        json(res, status, { ok: false, message: status === 500 ? "Error interno" : error.message, ...(error.details && { details: error.details }) });
    }
}

export { handleRequest };
