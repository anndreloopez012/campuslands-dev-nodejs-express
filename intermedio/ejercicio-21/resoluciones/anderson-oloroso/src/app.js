import express from 'express';
import renderRoutes from './routes/render.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(renderRoutes);

app.listen(PORT, () => {
  console.log(`[RENDER FARM RATE LIMIT SERVER] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-21`);
  console.log(`[RATE LIMIT] POST http://localhost:${PORT}/api/render-farm/render-jobs`);
});
