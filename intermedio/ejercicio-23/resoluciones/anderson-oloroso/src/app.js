import express from 'express';
import weldingRoutes from './routes/welding.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(weldingRoutes);

app.listen(PORT, () => {
  console.log(`[WELDING TEST SERVER] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-23`);
  console.log(`[HEAT INPUT] POST http://localhost:${PORT}/api/welding/heat-input`);
});
