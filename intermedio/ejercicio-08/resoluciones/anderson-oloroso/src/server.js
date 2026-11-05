import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[HYPERCARS SERVER] Servidor escuchando en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-08`);
  console.log(`[TELEMETRY] GET/POST http://localhost:${PORT}/api/hypercars/telemetry`);
});
