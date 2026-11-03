import express from 'express';
import routes from './routes/naves.routes.js';
import { manejarErrores } from './middlewares/error.middleware.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/basico/ejercicio-13', routes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.use(manejarErrores);

export default app;
