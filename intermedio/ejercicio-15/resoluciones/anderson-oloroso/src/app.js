import express from 'express';
import foodRoutes from './routes/food.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(foodRoutes);

app.listen(PORT, () => {
  console.log(`[STREETFOOD JWT SERVER] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-15`);
  console.log(`[LOGIN] POST http://localhost:${PORT}/api/streetfood/auth/login`);
});
