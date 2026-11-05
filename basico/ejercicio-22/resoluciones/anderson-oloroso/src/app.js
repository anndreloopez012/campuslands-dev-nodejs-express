import express from 'express';
import arqRoutes from './routes/arq.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(arqRoutes);

app.listen(PORT, () => {
  console.log(`[ARQ 3D] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/basico/ejercicio-22`);
  console.log(`[MATERIALS] GET http://localhost:${PORT}/api/arq3d/materials`);
  console.log(`[BUDGET] POST http://localhost:${PORT}/api/arq3d/budget`);
});
