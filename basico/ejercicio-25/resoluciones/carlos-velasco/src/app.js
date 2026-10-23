const express = require("express");
const characterRoutes = require("./routes/character.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  return res.status(200).json({
    ok: true,
    message: "API de videojuegos RPG funcionando correctamente"
  });
});

app.use("/api/characters", characterRoutes);

app.use((req, res) => {
  return res.status(404).json({
    ok: false,
    message: "Ruta no encontrada"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});