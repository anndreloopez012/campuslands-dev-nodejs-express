import { config } from '../config/index.js';

export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'dotenv y config' });

export const getStudioInfo = (_req, res) => res.status(200).json({
  ok: true,
  estudio: config.studioName,
  entorno: config.env,
  tarifaHoraUSD: config.tarifaHoraUSD,
  seguridadConfigurada: config.hasApiKey,
  puertoActivo: config.port
});
