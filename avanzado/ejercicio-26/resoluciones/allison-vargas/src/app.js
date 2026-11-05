import express from 'express';
import { createMatchRouter } from './routes/matches.js';
import { createMatchStore } from './services/match-store.js';

export function createApp({ store = createMatchStore() } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.get('/health', (request, response) => response.json({ status: 'ok' }));
  app.use('/api/matches', createMatchRouter(store));
  app.use((request, response) => response.status(404).json({ error: 'Ruta no encontrada' }));
  app.use((error, request, response, next) => response.status(error.status || 500).json({ error: error.status ? error.message : 'Error interno del servidor' }));
  return app;
}
