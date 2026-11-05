import express from 'express';
import { logger } from './middlewares/logger.middleware.js';
import workshopRoutes from './routes/workshop.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(logger);
app.use(workshopRoutes);

app.listen(PORT, () => {
  console.log(`[INTEGRADOR TALLER MOTOS] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/basico/ejercicio-30`);
  console.log(`[CRUD BIKES] http://localhost:${PORT}/api/workshop/bikes`);
});
