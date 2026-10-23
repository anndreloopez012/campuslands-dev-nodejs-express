import express from 'express';
import routes from './routes/partidas.routes.js';
import { config } from './config.js';

const app = express();

app.use(express.json());

if (config.debug) {
  app.use((req, res, next) => {
    console.log('[debug] ' + req.method + ' ' + req.url);
    next();
  });
}

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/basico/ejercicio-28', routes);

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

export default app;
