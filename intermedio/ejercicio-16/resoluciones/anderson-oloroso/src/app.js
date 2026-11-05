import express from 'express';
import sneakerRoutes from './routes/sneakers.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(sneakerRoutes);

app.listen(PORT, () => {
  console.log(`[SNEAKERS PROTECTED ROUTES] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-16`);
  console.log(`[VAULT PROTECTED] GET http://localhost:${PORT}/api/sneakers/vault`);
});
