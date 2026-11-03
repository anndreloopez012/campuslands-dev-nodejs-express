import express from 'express';
import routes from './routes/jugadores.routes.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/basico/ejercicio-02', routes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

export default app;
