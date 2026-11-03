const express = require("express");
const formulaRoutes = require("./routes/formula.routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "API de fórmulas químicas funcionando correctamente"
  });
});

app.use("/api/formulas", formulaRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});