import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[SHOOTERS SERVER] Servidor escuchando en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-02`);
  console.log(`[AGENTS] GET/POST http://localhost:${PORT}/api/shooters/agents`);
  console.log(`[WEAPONS] GET http://localhost:${PORT}/api/shooters/weapons`);
  console.log(`[MATCHES] GET/POST http://localhost:${PORT}/api/shooters/matches`);
});
