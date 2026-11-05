import * as scifiService from '../services/scifi.service.js';

export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'relaciones simples' });

export const listShips = (_req, res) => res.status(200).json({ ok: true, total: scifiService.getAllShips().length, data: scifiService.getAllShips() });

export const getShipCrew = (req, res) => {
  try {
    const data = scifiService.getShipWithCrew(req.params.id);
    return res.status(200).json({ ok: true, data });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, message: err.message });
  }
};

export const addCrew = (req, res) => {
  try {
    const { nombre, rango, especie } = req.body;
    if (!nombre) return res.status(400).json({ ok: false, message: 'El nombre del tripulante es requerido.' });
    const member = scifiService.assignCrewMember(req.params.id, { nombre, rango, especie });
    return res.status(201).json({ ok: true, message: 'Tripulante asignado a la nave', data: member });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, message: err.message });
  }
};
