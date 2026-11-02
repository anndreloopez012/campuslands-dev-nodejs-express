import { champions } from '../data/champions.data.js';

export const list = (req, res) => {
  const { role } = req.query;
  const data = role ? champions.filter((c) => c.role.toLowerCase() === role.toLowerCase()) : champions;
  res.status(200).json({ ok: true, total: data.length, data });
};

export const getOne = (req, res) => {
  const id = Number(req.params.id);
  const item = champions.find((x) => x.id === id);
  if (!item) return res.status(404).json({ ok: false, message: "Campeón no encontrado" });
  res.status(200).json({ ok: true, data: item });
};

export const create = (req, res) => {
  const { name, role, difficulty } = req.body || {};
  if (!name || !role || !difficulty) {
    return res.status(400).json({ ok: false, message: "Se requieren name, role y difficulty" });
  }

  const champion = { id: Math.max(0, ...champions.map((c) => c.id)) + 1, name, role, difficulty };
  champions.push(champion);
  res.status(201).json({ ok: true, data: champion });
};
