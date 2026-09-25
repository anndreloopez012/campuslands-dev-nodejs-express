import express from "express";
import playersRoutes from "./routes/players_routes.js";

const app = express();

app.use("/players", playersRoutes);

app.listen(3000, () => {
    console.log("Servidor ejecutándose en http://localhost:3000");
});