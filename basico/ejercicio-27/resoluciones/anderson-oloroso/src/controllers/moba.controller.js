import * as mobaService from '../services/moba.service.js';

export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'logs simples' });

export const listTournaments = (_req, res) => res.status(200).json({ ok: true, total: mobaService.getTournaments().length, data: mobaService.getTournaments() });

export const addTournament = (req, res) => {
  const { torneo, fase } = req.body;
  if (!torneo) return res.status(400).json({ ok: false, message: 'El nombre del torneo es obligatorio.' });
  const created = mobaService.createTournament({ torneo, fase });
  return res.status(201).json({ ok: true, data: created });
};
