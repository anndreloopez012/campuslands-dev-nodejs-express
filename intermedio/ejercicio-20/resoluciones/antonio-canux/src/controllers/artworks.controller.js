import { artworks } from '../data/artworks.data.js';

export const list = (req, res) => {
  res.status(200).json({ ok: true, total: artworks.length, data: artworks });
};

export const create = (req, res) => {
  const { title, artist, tool } = req.body || {};
  if (!title || !artist || !tool) return res.status(400).json({ ok: false, message: "Se requieren title, artist y tool" });

  const artwork = { id: Math.max(0, ...artworks.map((a) => a.id)) + 1, title, artist, tool };
  artworks.push(artwork);
  res.status(201).json({ ok: true, data: artwork });
};
