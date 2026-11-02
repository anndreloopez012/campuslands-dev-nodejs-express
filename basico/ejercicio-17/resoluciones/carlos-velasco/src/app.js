const express = require("express");

const destinationsRoutes = require("./routes/destinations.routes");

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Servidor funcionando correctamente",
    topic: "rutas GET"
  });
});

app.use("/api/destinations", destinationsRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});