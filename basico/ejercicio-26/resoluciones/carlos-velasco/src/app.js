const express = require("express");
const matchRoutes = require("./routes/match.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  return res.status(200).json({
    ok: true,
    message: "API de shooters competitivos funcionando correctamente"
  });
});

app.use("/api/matches", matchRoutes);

app.use((req, res) => {
  return res.status(404).json({
    ok: false,
    message: "Ruta no encontrada"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});