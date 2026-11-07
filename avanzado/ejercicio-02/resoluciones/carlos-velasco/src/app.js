const express = require("express");
const { apiRouter, registeredModules } = require("./modules");
const { errorHandler } = require("./core");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Backend modular de shooters listo para crecer",
    topic: "arquitectura escalable",
    modules: registeredModules.map((module) => module.name),
  });
});

app.use(apiRouter);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => console.log(`Backend modular de shooters escuchando en el puerto ${PORT}`));
}
