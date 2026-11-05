import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[BR SERVER] Servidor escuchando en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-04`);
  console.log(`[STORM] GET http://localhost:${PORT}/api/br/storm-phases`);
  console.log(`[DAMAGE] POST http://localhost:${PORT}/api/br/calculate-damage`);
  console.log(`[AIRDROP] POST http://localhost:${PORT}/api/br/airdrop`);
});
