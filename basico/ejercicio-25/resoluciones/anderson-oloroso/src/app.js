import express from 'express';
import rpgRoutes from './routes/rpg.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(rpgRoutes);

app.listen(PORT, () => {
  console.log(`[RPG INVENTORY SERVER] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/basico/ejercicio-25`);
  console.log(`[INVENTORY] http://localhost:${PORT}/api/rpg/inventory`);
});
