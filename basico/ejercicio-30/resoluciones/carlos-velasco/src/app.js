const express = require("express");
const motorcycleRoutes = require("./routes/motorcycle.routes");

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Servidor funcionando correctamente",
    topic: "proyecto integrador basico"
  });
});

app.use("/api/motorcycles", motorcycleRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});