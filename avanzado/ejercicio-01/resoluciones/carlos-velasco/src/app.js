const express = require("express");

const versionRoutes = require("./routes/index.routes");
const errorHandler = require("./middlewares/error.handler");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "API de RPG con versionado por URI",
    topic: "diseno API versionada",
  });
});

app.use("/api", versionRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`API versionada de RPG escuchando en el puerto ${PORT}`);
  });
}
