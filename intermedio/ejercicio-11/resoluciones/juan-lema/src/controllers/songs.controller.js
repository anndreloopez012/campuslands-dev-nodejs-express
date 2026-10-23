import { searchSongs, getSongById, createSong } from "../services/songs.service.js";

function getSongs(req, res) {
  const { q } = req.query;
  if (q !== undefined && (typeof q !== "string" || q.trim().length < 2)) return res.status(400).json({ ok: false, message: "q debe tener al menos 2 caracteres" });

  const data = searchSongs(q?.trim());
  res.json({ ok: true, query: q?.trim() ?? null, total: data.length, data });
}

function getSong(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ ok: false, message: "id debe ser numerico" });

  const song = getSongById(id);
  if (!song) return res.status(404).json({ ok: false, message: `Cancion con id ${id} no encontrada` });

  res.json({ ok: true, data: song });
}

function postSong(req, res) {
  try {
    res.status(201).json({ ok: true, data: createSong(req.body || {}) });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getSongs, getSong, postSong };
