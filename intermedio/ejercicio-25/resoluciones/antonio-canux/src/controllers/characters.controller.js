import { characters } from '../data/characters.data.js';

export const list = (req, res) => {
  res.status(200).json({ ok: true, total: characters.length, data: characters });
};

export const getOne = (req, res) => {
  const id = Number(req.params.id);
  const item = characters.find((x) => x.id === id);
  if (!item) return res.status(404).json({ ok: false, message: "Personaje no encontrado" });
  res.status(200).json({ ok: true, data: item });
};

export const create = (req, res) => {
  const { name, class: characterClass, level } = req.body || {};
  if (!name || !characterClass || !Number.isInteger(level)) {
    return res.status(400).json({ ok: false, message: "Se requieren name, class y level (entero)" });
  }

  const character = { id: Math.max(0, ...characters.map((c) => c.id)) + 1, name, class: characterClass, level };
  characters.push(character);
  res.status(201).json({ ok: true, data: character });
};
