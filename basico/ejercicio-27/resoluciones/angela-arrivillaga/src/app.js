import express from 'express';
import routes from './routes/campeones.routes.js';
import { registrarPeticion } from './middlewares/logger.middleware.js';

const app = express();

app.use(registrarPeticion);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/basico/ejercicio-27', routes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

export default app;
