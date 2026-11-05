import express from 'express';
import tourismRoutes from './routes/tourism.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(tourismRoutes);

app.listen(PORT, () => {
  console.log(`[TOURISM RBAC SERVER] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-17`);
  console.log(`[ROLES] GET http://localhost:${PORT}/api/tourism/discounts`);
});
