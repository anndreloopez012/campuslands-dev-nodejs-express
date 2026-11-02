import { matches } from '../data/matches.data.js';

export const list = (req, res) => {
  const { mode } = req.query;
  const data = mode ? matches.filter((m) => m.mode.toLowerCase() === mode.toLowerCase()) : matches;
  res.status(200).json({ ok: true, total: data.length, data });
};

export const getOne = (req, res) => {
  const id = Number(req.params.id);
  const item = matches.find((x) => x.id === id);
  if (!item) return res.status(404).json({ ok: false, message: "Partida no encontrado" });
  res.status(200).json({ ok: true, data: item });
};

export const create = (req, res) => {
  const { map, mode, players, winner } = req.body || {};
  if (!map || !mode || !Number.isInteger(players) || !winner) {
    return res.status(400).json({ ok: false, message: "Se requieren map, mode, players (entero) y winner" });
  }

  const match = { id: Math.max(0, ...matches.map((m) => m.id)) + 1, map, mode, players, winner };
  matches.push(match);
  res.status(201).json({ ok: true, data: match });
};
