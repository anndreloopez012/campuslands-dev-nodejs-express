import express from 'express';
import chemRoutes from './routes/chemistry.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(chemRoutes);

app.listen(PORT, () => {
  console.log(`[CHEMISTRY CRUD SERVER] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/basico/ejercicio-24`);
  console.log(`[CRUD] http://localhost:${PORT}/api/chemistry/formulas`);
});
