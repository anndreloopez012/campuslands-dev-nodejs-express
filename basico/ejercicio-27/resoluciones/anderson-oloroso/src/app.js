import express from 'express';
import { simpleLogger } from './middlewares/logger.middleware.js';
import mobaRoutes from './routes/moba.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(simpleLogger); // Registra logs en consola para cada petición
app.use(mobaRoutes);

app.listen(PORT, () => {
  console.log(`[MOBA TOURNAMENTS SERVER] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/basico/ejercicio-27`);
  console.log(`[TOURNAMENTS] http://localhost:${PORT}/api/moba/tournaments`);
});
