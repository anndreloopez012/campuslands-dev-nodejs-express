import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`[Avanzado 30 - proyecto final avanzado] Servidor activo en http://localhost:${PORT}`);
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
