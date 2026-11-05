import * as mmService from '../services/matchmaking.service.js';

export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'configuracion por entorno' });

export const getStatus = (_req, res) => res.status(200).json({ ok: true, data: mmService.getServerStatus() });
