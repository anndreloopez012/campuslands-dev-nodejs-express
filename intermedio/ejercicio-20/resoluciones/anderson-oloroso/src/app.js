import express from 'express';
import { customCors } from './middlewares/cors.middleware.js';
import artRoutes from './routes/art.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(customCors); // Middleware CORS con lista blanca de orígenes
app.use(artRoutes);

app.listen(PORT, () => {
  console.log(`[DIGITAL ART CORS SERVER] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-20`);
  console.log(`[GALLERIES] GET http://localhost:${PORT}/api/digital-art/galleries`);
});
