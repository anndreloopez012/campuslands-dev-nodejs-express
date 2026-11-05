import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[FOOTBALL SERVER] Servidor escuchando en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-05`);
  console.log(`[TEAMS] CRUD http://localhost:${PORT}/api/football/teams`);
});
