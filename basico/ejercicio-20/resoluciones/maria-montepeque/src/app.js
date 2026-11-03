import { createApp } from "./core/create-app.js";
import { jsonBody } from "./middlewares/json-body.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { canvasesRoutes } from "./routes/canvases.routes.js";

const app = createApp();

app.use(jsonBody({ limit: "1kb", strict: true }));

app.get("/health", (req, res) => {
    res.json({ ok: true, message: "API de dibujo digital activa" });
});

canvasesRoutes(app);

app.use(errorHandler);

export { app };
