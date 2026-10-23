const express = require("express");
const env = require("./config/env");
const matchRoutes = require("./routes/match.routes");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Servidor funcionando correctamente",
    environment: env.nodeEnv,
    apiName: env.apiName
  });
});

app.use("/api/matches", matchRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada"
  });
});

app.listen(env.port, () => {
  console.log(`${env.apiName} ejecutándose en el puerto ${env.port}`);
  console.log(`Entorno: ${env.nodeEnv}`);
});