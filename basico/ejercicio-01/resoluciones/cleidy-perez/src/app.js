const express = require("express");
const statusRoutes = require("./routes/status.routes");

const app = express();

// Middlewares
app.use(express.json());

// Rutas base de la aplicación RPG
app.use("/api/v1", statusRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "La zona o ruta RPG solicitada no existe."
  });
});

module.exports = app;