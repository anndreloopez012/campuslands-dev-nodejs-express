import { trips } from '../data/trips.data.js';

export const list = (req, res) => {
  res.status(200).json({ ok: true, total: trips.length, data: trips });
};

export const create = (req, res) => {
  const { destination, days, priceUsd } = req.body || {};
  if (!destination || !Number.isInteger(days) || typeof priceUsd !== 'number') {
    return res.status(400).json({ ok: false, message: "Se requieren destination, days (entero) y priceUsd" });
  }

  const trip = { id: Math.max(0, ...trips.map((t) => t.id)) + 1, destination, days, priceUsd };
  trips.push(trip);
  res.status(201).json({ ok: true, data: trip });
};

export const remove = (req, res) => {
  const index = trips.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ ok: false, message: "Viaje no encontrado" });

  const [deleted] = trips.splice(index, 1);
  res.status(200).json({ ok: true, data: deleted });
};
