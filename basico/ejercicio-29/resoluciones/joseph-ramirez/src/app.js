const express = require("express");

const playersRoutes = require("./routes/players.routes");

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  return res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "README tecnico"
  });
});

app.use("/players", playersRoutes);

app.use((req, res) => {
  return res.status(404).json({
    ok: false,
    status: 404,
    message: "Ruta no encontrada"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor Express ejecutandose en http://localhost:${PORT}`);
});