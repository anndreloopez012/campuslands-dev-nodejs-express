import express from 'express';
import routes from './routes/obras.routes.js';
import { registrarPeticion } from './middlewares/logger.middleware.js';
import { manejarJsonInvalido } from './middlewares/json.middleware.js';

const app = express();

app.use(registrarPeticion);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/basico/ejercicio-20', routes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

app.use(manejarJsonInvalido);

export default app;
