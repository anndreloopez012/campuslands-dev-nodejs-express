// Controlador: recibe la peticion HTTP, llama al servicio
// y traduce cada tipo de error a un status HTTP claro.

import { obtenerFichaPorModelo } from '../services/fichas.service.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'path y rutas seguras',
  });
}

export async function obtenerFicha(req, res) {
  try {
    const { modelo } = req.params;
    const ficha = await obtenerFichaPorModelo(modelo);

    return res.status(200).json({ ok: true, ficha });
  } catch (error) {
    if (error.code === 'RUTA_INVALIDA') {
      return res.status(400).json({
        ok: false,
        message: 'Nombre de modelo invalido',
      });
    }

    if (error.code === 'ENOENT') {
      return res.status(404).json({
        ok: false,
        message: 'No existe una ficha tecnica para ese modelo',
      });
    }

    console.error('Error leyendo la ficha tecnica:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al leer la ficha tecnica',
    });
  }
}
