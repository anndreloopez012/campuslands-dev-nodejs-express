import express from 'express';
import weldingRoutes from './routes/welding.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(weldingRoutes);

app.listen(PORT, () => {
  console.log(`[WELDING SERVER] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/basico/ejercicio-23`);
  console.log(`[JOBS] GET/POST http://localhost:${PORT}/api/welding/jobs`);
});
