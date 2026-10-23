import { createRouter, json, HttpError } from "./core/http.js";
import { authenticate, rateLimit, maintenance } from "./middlewares/guards.js";
import { arenaRoutes } from "./routes/arena.routes.js";

const router = createRouter();
const PUBLIC_PATHS = ["/status-codes"];

arenaRoutes(router);

async function handleRequest(req, res) {
    try {
        const { handler, allowed } = router.resolve(req);
        const pathname = req.url.split("?")[0];

        if (!handler) {
            if (allowed.length > 0) throw new HttpError(405, `${req.method} no permitido en ${pathname}`, { Allow: allowed.join(", ") });
            throw new HttpError(404, `La ruta ${pathname} no existe`);
        }

        maintenance(req);

        if (!PUBLIC_PATHS.includes(pathname)) {
            authenticate(req);
            rateLimit(req);
        }

        await handler(req, res);
    } catch (error) {
        const status = error instanceof HttpError ? error.status : 500;
        if (status === 500) console.error(error);

        json(res, status, { message: status === 500 ? "Error interno del servidor" : error.message }, error.headers ?? {});
    }
}

export { handleRequest };
