const express = require("express");
const heroRoutes = require("./routes/hero.routes");

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Validacion por schemas activa en el iDraft de MOBA",
    topic: "validacion con schemas",
  });
});

app.use("/api", heroRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const response = { ok: false, message: statusCode === 500 ? "Error interno del servidor" : error.message };
  if (error.details) {
    response.details = error.details;
  }
  if (statusCode === 500) {
    console.error("[error no controlado]", error);
  }
  res.status(statusCode).json(response);
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3003;
  app.listen(PORT, () => console.log(`Draft de MOBA escuchando en el puerto ${PORT}`));
}
