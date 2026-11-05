import express from 'express';
import scifiRoutes from './routes/scifi.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(scifiRoutes);

app.listen(PORT, () => {
  console.log(`[SCIFI SHIPS SERVER] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-13`);
  console.log(`[RELATIONS] GET http://localhost:${PORT}/api/scifi/ships/1/crew`);
});
