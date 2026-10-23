import express from 'express';
import routes from './routes/personajes.routes.js';
import { fallo } from './utils/respuestas.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/basico/ejercicio-25', routes);

app.use((req, res) => {
  fallo(res, 404, 'Ruta no encontrada');
});

export default app;
