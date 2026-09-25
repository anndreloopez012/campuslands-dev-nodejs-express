const express = require("express");

const healthRoutes = require("./routes/health.routes");

const app = express();

const PORT = 3000;

// Middleware para interpretar JSON
app.use(express.json());

// Mensajes del Node.js runtime
console.log("=================================");
console.log("Node.js Runtime iniciado");
console.log(`Versión de Node.js: ${process.version}`);
console.log(`Sistema operativo: ${process.platform}`);
console.log(`Puerto configurado: ${PORT}`);
console.log("=================================");

// Ruta principal de salud
app.use("/health", healthRoutes);

// Manejo de rutas inexistentes
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada",
    path: req.originalUrl
  });
});

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});