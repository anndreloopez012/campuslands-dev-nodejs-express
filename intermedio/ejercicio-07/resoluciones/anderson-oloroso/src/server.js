import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[LUXURY CARS SERVER] Servidor escuchando en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-07`);
  console.log(`[CARS] GET http://localhost:${PORT}/api/luxury-cars`);
});
