import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[KICKBOXING SERVER] Servidor escuchando en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-09`);
  console.log(`[FIGHTERS] GET http://localhost:${PORT}/api/kickboxing/fighters?page=1&limit=3`);
});
