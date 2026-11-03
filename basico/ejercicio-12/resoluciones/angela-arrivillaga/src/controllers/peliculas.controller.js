import { obtenerPeliculas, buscarPelicula, obtenerResumen } from '../services/peliculas.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'async await'
  });
}

export async function listar(req, res) {
  try {
    const lista = await obtenerPeliculas();
    res.json({ ok: true, data: lista });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error al obtener las peliculas' });
  }
}

export async function obtener(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un numero' });
  }

  try {
    const pelicula = await buscarPelicula(id);
    res.json({ ok: true, data: pelicula });
  } catch (error) {
    res.status(404).json({ ok: false, message: error.message });
  }
}

export async function resumen(req, res) {
  try {
    const datos = await obtenerResumen();
    res.json({ ok: true, data: datos });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error al obtener el resumen' });
  }
}
