const express = require("express");
const modelRoutes = require("./routes/model.routes");

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "API de arquitectura 3D funcionando correctamente"
  });
});

app.use("/api/models", modelRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});