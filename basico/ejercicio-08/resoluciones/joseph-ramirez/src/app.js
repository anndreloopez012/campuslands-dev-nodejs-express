require("dotenv").config();

const express = require("express");
const configRoutes = require("./routes/config.routes");

const app = express();

const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.use("/", configRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
  console.log(`Aplicacion: ${process.env.APP_NAME || "HyperDrive API"}`);
  console.log(`Entorno: ${process.env.APP_ENV || "development"}`);
});