import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[PINGPONG SERVER] Servidor escuchando en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-10`);
  console.log(`[PLAYERS] GET http://localhost:${PORT}/api/pingpong/players?sortBy=puntosElo&order=desc`);
});
