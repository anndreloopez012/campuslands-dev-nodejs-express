import express from "express";
import motoRoutes from "./routes/moto.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({
        ok: true,
        message: "API funcionando correctamente",
        topic: "path y rutas seguras"
    });
});

app.use("/api/motos", motoRoutes);

export default app;