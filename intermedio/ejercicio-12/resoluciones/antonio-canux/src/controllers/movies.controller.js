import { movies } from '../data/movies.data.js';

export const list = (req, res) => {
  res.status(200).json({ ok: true, total: movies.length, data: movies });
};

export const getOne = (req, res) => {
  const id = Number(req.params.id);
  const item = movies.find((x) => x.id === id);
  if (!item) return res.status(404).json({ ok: false, message: "Película no encontrado" });
  res.status(200).json({ ok: true, data: item });
};
