import * as musicService from '../services/music.service.js';

export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'busqueda textual' });

export const getTracks = (req, res) => {
  const { q } = req.query;
  const results = musicService.searchTracks(q);
  return res.status(200).json({
    ok: true,
    criterioBusqueda: q || null,
    total: results.length,
    data: results
  });
};
