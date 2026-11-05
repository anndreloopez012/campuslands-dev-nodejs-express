import express from 'express';
import { config } from './config/index.js';
import tattooRoutes from './routes/tattoos.routes.js';

const app = express();
app.use(express.json());
app.use(tattooRoutes);

app.listen(config.port, () => {
  console.log(`[TATTOOS CONFIG SERVER] Servidor en http://localhost:${config.port}`);
  console.log(`[HEALTH] GET http://localhost:${config.port}/intermedio/ejercicio-19`);
  console.log(`[STUDIO] GET http://localhost:${config.port}/api/tattoos/studio-info`);
});
