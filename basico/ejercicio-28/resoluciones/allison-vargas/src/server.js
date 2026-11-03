import app from './app.js';
import { config } from './config/index.js';

app.listen(config.puerto, () => {
  console.log('==================================');
  console.log(` La isla de battle royale esta lista (entorno: ${config.entorno})...`);
  console.log('==================================');
  console.log(`Servidor escuchando en http://localhost:${config.puerto}`);
  console.log(`Maximo de jugadores por partida: ${config.maxJugadoresPorPartida}`);
});
