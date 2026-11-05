import express from 'express';
import authRoutes from './routes/auth.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(authRoutes);

app.listen(PORT, () => {
  console.log(`[SKYDIVE HASH AUTH SERVER] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-18`);
  console.log(`[AUTH] POST http://localhost:${PORT}/api/skydive/register`);
});
