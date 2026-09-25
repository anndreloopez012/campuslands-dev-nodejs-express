import { createRouter } from "./core/router.js";
import { json } from "./core/response.js";
import { BodyError } from "./core/body.js";
import { bookingsRoutes } from "./routes/bookings.routes.js";

const router = createRouter();

router.get("/", (req, res) => {
    json(res, 200, {
        ok: true,
        message: "Bienvenido a Skydive Bookings API",
        endpoints: ["GET /bookings", "POST /bookings", "POST /bookings/:id/confirm"],
    });
});

bookingsRoutes(router);

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
        const status = error instanceof BodyError ? error.status : 500;
        json(res, status, { ok: false, message: error.message });
    }
}

export { handleRequest };