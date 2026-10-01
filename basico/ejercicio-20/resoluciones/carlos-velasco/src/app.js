const express = require("express");
const drawingRoutes = require("./routes/drawing.routes");

const app = express();
const PORT = 3000;

// Middleware para interpretar solicitudes con Content-Type: application/json
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Servidor funcionando correctamente"
  });
});

app.use("/api/drawings", drawingRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});