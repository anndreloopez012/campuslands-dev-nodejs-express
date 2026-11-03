import { buscarPeliculas } from '../services/peliculas.service.js';

export async function obtenerPeliculas(req, res) {
  try {
    const peliculas = await buscarPeliculas();

    res.json({
      ok: true,
      peliculas
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'No se pudieron obtener las películas'
    });
  }
}