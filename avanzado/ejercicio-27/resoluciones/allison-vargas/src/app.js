import express from 'express';
import { loadConfig } from './config.js';

export function createApp(config = loadConfig()) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use((request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', config.corsOrigin);
    next();
  });
  app.get('/health', (request, response) => response.json({ status: 'ok', service: config.serviceName }));
  app.get('/api/arena', (request, response) => response.json({ data: { service: config.serviceName, environment: config.nodeEnv, logLevel: config.logLevel } }));
  app.use((request, response) => response.status(404).json({ error: 'Ruta no encontrada' }));
  return app;
}
