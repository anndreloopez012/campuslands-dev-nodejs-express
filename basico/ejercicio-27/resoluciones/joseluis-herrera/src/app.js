import express from "express";

import equipoRoutes from "./routes/equipoRoutes.js";
import logger from "./middlewares/logger.js";

const app = express();

const PORT = 3000;

app.use(express.json());

app.use(logger);

app.get("/", (req, res) => {
    res.status(200).send(
        "API de MOBA esports funcionando"
    );
});

app.use("/equipos", equipoRoutes);

app.listen(PORT, () => {
    console.log(
        `Servidor ejecutándose en http://localhost:${PORT}`
    );
});