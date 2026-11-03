import { buscarMusicas } from '../services/musicas.service.js';

export async function obtenerMusicas(req, res) {
  try {
    const musicas = await buscarMusicas();

    res.json({
      ok: true,
      musicas
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'No se pudieron obtener las músicas'
    });
  }
}