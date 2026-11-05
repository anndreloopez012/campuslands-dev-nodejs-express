import { studios } from '../data/studios.data.js';
import { config } from '../config/env.js';

export const list = (req, res) => {
  res.status(200).json({ ok: true, studio: config.studioName, data: studios.slice(0, config.maxResults) });
};

// Muestra la configuración sin exponer secretos
export const showConfig = (req, res) => {
  res.status(200).json({
    ok: true,
    data: { port: config.port, studioName: config.studioName, maxResults: config.maxResults, apiKey: '***' }
  });
};
