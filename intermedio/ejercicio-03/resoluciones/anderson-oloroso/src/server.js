import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[MOBA SERVER] Servidor escuchando en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-03`);
  console.log(`[TEAMS] GET http://localhost:${PORT}/api/moba/teams`);
  console.log(`[CHAMPIONS] GET http://localhost:${PORT}/api/moba/champions`);
  console.log(`[DRAFTS] POST http://localhost:${PORT}/api/moba/drafts`);
});
