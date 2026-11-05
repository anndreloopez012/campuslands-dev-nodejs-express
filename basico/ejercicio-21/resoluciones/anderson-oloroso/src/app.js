import express from 'express';
import scenesRoutes from './routes/scenes.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(scenesRoutes);

app.listen(PORT, () => {
  console.log(`[ANIMATION 3D] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/basico/ejercicio-21`);
  console.log(`[SCENES] GET http://localhost:${PORT}/api/animation/scenes`);
});
