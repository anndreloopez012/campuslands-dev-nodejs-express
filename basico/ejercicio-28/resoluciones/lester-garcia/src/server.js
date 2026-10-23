import app from "./app.js";

// Configuración de puerto por entorno con fallback a 3000
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.listen(PORT, () => {
  console.log(`[Battle Royale API] Servidor corriendo en http://localhost:${PORT} [Modo: ${NODE_ENV}]`);
});