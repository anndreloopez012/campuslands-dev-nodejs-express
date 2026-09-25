const express = require("express");

const motorcyclesRoutes = require("./routes/motorcycles.routes");

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  return res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "proyecto integrador basico"
  });
});

app.use("/motorcycles", motorcyclesRoutes);

app.use((req, res) => {
  return res.status(404).json({
    ok: false,
    status: 404,
    message: "Ruta no encontrada"
  });
});

app.listen(PORT, () => {
  console.log(
    `Servidor Express ejecutandose en http://localhost:${PORT}`
  );
});