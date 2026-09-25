import express from "express";

import squadsRoutes from "./routes/squads.routes.js";

const app = express();

const PORT = 3000;

app.use(express.json());

console.log("=================================");
console.log("BASICO 04 - Modulos ES Modules");
console.log(`Node.js: ${process.version}`);
console.log("Sistema de módulos: ES Modules");
console.log("=================================");

app.use("/squads", squadsRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada",
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});