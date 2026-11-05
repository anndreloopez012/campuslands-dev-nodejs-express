import express from 'express';
import { createMatchRoutes } from './routes/matches.js';
import { createMatchService } from './services/match-service.js';

export function createApp({ service = createMatchService() } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  app.get('/health', (request, response) => response.json({ status: 'ok' }));
  app.use('/api/matches', createMatchRoutes(service));
  app.use((request, response) => response.status(404).json({ error: 'Ruta no encontrada' }));
  app.use((error, request, response, next) => response.status(error.status || 500).json({ error: error.status ? error.message : 'Error interno del servidor' }));
  return app;
}
