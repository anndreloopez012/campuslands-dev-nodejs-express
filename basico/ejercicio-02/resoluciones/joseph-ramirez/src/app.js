const express = require("express");

const matchesRoutes = require("./routes/matches.routes");

const app = express();

const PORT = 3000;

app.use(express.json());

if (process.argv.includes("--info")) {
  console.log("=================================");
  console.log("Información del proyecto");
  console.log("Ejercicio: BASICO 02");
  console.log("Tema: npm scripts y package.json");
  console.log(`Node.js: ${process.version}`);
  console.log(`Sistema operativo: ${process.platform}`);
  console.log("=================================");
}

app.use("/matches", matchesRoutes);

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