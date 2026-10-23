import { createRouter } from "./core/router.js";
import { json } from "./core/response.js";
import { toursRoutes } from "./routes/tours.routes.js";

const router = createRouter();

router.get("/", (req, res) => {
    json(res, 200, {
        ok: true,
        message: "Bienvenido a Travel Tours API",
        endpoints: ["/tours", "/tours/:slug", "/tours/:slug/itinerary", "/countries", "/search?q="],
    });
});

toursRoutes(router);

function handleRequest(req, res) {
    if (req.method !== "GET") {
        return json(res, 405, { ok: false, message: "Esta API solo acepta GET" });
    }

    const handler = router.resolve(req);
    if (!handler) {
        return json(res, 404, { ok: false, message: `Ruta ${req.url} no encontrada` });
    }

    handler(req, res);
}

export { handleRequest };