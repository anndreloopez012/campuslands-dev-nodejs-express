import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[MECHANIC SERVER] Servidor escuchando en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-06`);
  console.log(`[ORDERS] GET/POST http://localhost:${PORT}/api/mechanic/orders`);
});
