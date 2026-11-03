// En vez de construir la respuesta de error dentro de cada catch, se la dejamos con
// next(error) al middleware central que esta al final de app.js.

import { listarNaves, buscarNavePorId } from '../services/naves.service.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'manejo de errores',
  });
}

export async function obtenerNaves(req, res, next) {
  try {
    const naves = await listarNaves();

    return res.status(200).json({ ok: true, naves });
  } catch (error) {
    next(error);
  }
}

export async function obtenerNavePorId(req, res, next) {
  try {
    const { id } = req.params;
    const nave = await buscarNavePorId(id);

    return res.status(200).json({ ok: true, nave });
  } catch (error) {
    next(error);
  }
}

// Ruta pensada solo para forzar un error NO esperado (no un AppError)
// y comprobar que el middleware central tambien lo atrapa, sin
// exponer detalles internos al cliente.
export function forzarErrorInesperado(req, res, next) {
  throw new Error('Fallo simulado en el motor de hipervelocidad');
}
