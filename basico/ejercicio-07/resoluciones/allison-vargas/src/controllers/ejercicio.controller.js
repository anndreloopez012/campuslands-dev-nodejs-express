// Controlador: recibe la peticion HTTP, llama al servicio y arma la respuesta.

import { listarAutos } from '../services/autos.service.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'process.argv y CLI',
    cli_disponible: 'npm run cli -- --marca=Ferrari',
  });
}

export async function obtenerAutos(req, res) {
  try {
    const autos = await listarAutos();

    return res.status(200).json({ ok: true, autos });
  } catch (error) {
    console.error('Error leyendo el catalogo de autos:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al leer el catalogo de autos',
    });
  }
}
