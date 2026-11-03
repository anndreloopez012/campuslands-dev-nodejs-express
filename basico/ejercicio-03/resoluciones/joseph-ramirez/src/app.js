const express = require("express");

const teamsRoutes = require("./routes/teams.routes");

const app = express();

const PORT = 3000;

app.use(express.json());

console.log("=================================");
console.log("BASICO 03 - Modulos CommonJS");
console.log(`Node.js: ${process.version}`);
console.log("=================================");

app.use("/teams", teamsRoutes);

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