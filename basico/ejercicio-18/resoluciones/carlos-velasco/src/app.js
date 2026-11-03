const express = require("express");

const skydivingRoutes = require("./routes/skydiving.routes");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Servidor funcionando correctamente",
    topic: "rutas POST"
  });
});

app.use("/api/jumps", skydivingRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});