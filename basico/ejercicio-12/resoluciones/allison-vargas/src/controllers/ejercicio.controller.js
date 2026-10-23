// verPelicula() encadena
// TRES pasos asincronos con await (buscar, verificar, reproducir), y
// los tres quedan protegidos por UN SOLO bloque try/catch. Si cualquiera
// de los pasos falla, la ejecucion salta directo al catch, sin necesidad
// de un .catch() por cada paso (como si hacia en el ejercicio 11).

import {
  listarPeliculas,
  buscarPeliculaPorId,
  verificarEdadPermitida,
  reproducirPelicula,
} from '../services/peliculas.service.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'async await',
  });
}

export async function obtenerPeliculas(req, res) {
  try {
    const peliculas = await listarPeliculas();

    return res.status(200).json({ ok: true, peliculas });
  } catch (error) {
    console.error('Error listando peliculas:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al listar las peliculas',
    });
  }
}

export async function verPelicula(req, res) {
  try {
    const { id } = req.params;
    const edad = Number(req.query.edad);

    if (!req.query.edad || Number.isNaN(edad)) {
      return res.status(400).json({
        ok: false,
        message: 'Debes indicar tu edad con ?edad=',
      });
    }

    const pelicula = await buscarPeliculaPorId(id);
    verificarEdadPermitida(pelicula, edad);
    const reproduccion = await reproducirPelicula(pelicula);

    return res.status(200).json({ ok: true, reproduccion });
  } catch (error) {
    if (error.code === 'PELICULA_NO_ENCONTRADA') {
      return res.status(404).json({ ok: false, message: error.message });
    }

    if (error.code === 'EDAD_INSUFICIENTE') {
      return res.status(403).json({ ok: false, message: error.message });
    }

    console.error('Error reproduciendo pelicula:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al reproducir la pelicula',
    });
  }
}
