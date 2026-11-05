import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[RPG SERVER] Servidor escuchando en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-01`);
  console.log(`[RECURSO] GET/POST http://localhost:${PORT}/api/rpg/characters`);
});
