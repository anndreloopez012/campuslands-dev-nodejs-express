import { createRouter } from "./core/router.js";
import { json } from "./core/response.js";
import { studioRoutes } from "./routes/studio.routes.js";

const router = createRouter();

router.get("/", (req, res) => {
    json(res, 200, {
        ok: true,
        message: "Bienvenido a Ink Studio API",
        endpoints: [
            "/artists",
            "/artists/:artistId",
            "/artists/:artistId/designs?style=&maxPrice=&sort=&order=&page=&limit=",
            "/designs/:designId/quote/:size",
        ],
    });
});

studioRoutes(router);

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
