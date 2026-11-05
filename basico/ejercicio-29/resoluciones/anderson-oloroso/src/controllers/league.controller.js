import * as leagueService from '../services/league.service.js';

export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'README tecnico' });

export const listStandings = (_req, res) => res.status(200).json({ ok: true, total: leagueService.getStandings().length, data: leagueService.getStandings() });

export const createTeam = (req, res) => {
  const { club, modalidad } = req.body;
  if (!club) return res.status(400).json({ ok: false, message: 'El nombre del club es requerido.' });
  const team = leagueService.registerTeam({ club, modalidad });
  return res.status(201).json({ ok: true, message: 'Club registrado en tabla de posiciones', data: team });
};
