const express = require("express");
const songsRoutes = require("./routes/songs.routes");

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "promesas basicas"
  });
});

app.use("/songs", songsRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});