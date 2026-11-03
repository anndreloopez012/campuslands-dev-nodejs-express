import { songs } from '../data/songs.data.js';

// Minúsculas y sin acentos para que "cancion" encuentre "Canción"
const normalize = (text) => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const search = (req, res) => {
  const q = (req.query.q || '').trim();
  if (q.length < 2) {
    return res.status(400).json({ ok: false, message: "El parámetro q debe tener al menos 2 caracteres" });
  }

  const term = normalize(q);
  const results = songs.filter((s) => [s.title, s.artist, s.genre].some((field) => normalize(field).includes(term)));

  res.status(200).json({ ok: true, query: q, total: results.length, data: results });
};
