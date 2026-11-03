const express = require("express");
const fightersRoutes = require("./routes/fighters.routes");

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "JSON y persistencia simple"
  });
});

app.use("/fighters", fightersRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});