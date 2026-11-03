import { createRouter } from "./core/router.js";
import { json } from "./core/http.js";
import { apiRouter } from "./routes/index.js";

const root = createRouter();

root.get("/", (req, res) => {
    const endpoints = apiRouter.flatten("/api").map((route) => `${route.method} ${route.path}`);
    json(res, 200, { ok: true, message: "Bienvenido a Studio 3D API", endpoints });
});

root.use("/api", apiRouter);

async function handleRequest(req, res) {
    const { handler, pathExists } = root.resolve(req);

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
