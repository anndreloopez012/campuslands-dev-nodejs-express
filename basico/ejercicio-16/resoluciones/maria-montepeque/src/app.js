import { createApp } from "./core/create-app.js";
import { healthRoutes } from "./routes/health.routes.js";
import { dropsRoutes } from "./routes/drops.routes.js";

const app = createApp();

app.get("/", (req, res) => {
    res.json({ ok: true, message: "Bienvenido a Sneaker Drops API", endpoints: ["/health", "/drops"] });
});

healthRoutes(app);
dropsRoutes(app);

app.use((req, res) => {
    res.status(404).json({ ok: false, message: `Ruta ${req.method} ${req.url} no encontrada` });
});

export { app };