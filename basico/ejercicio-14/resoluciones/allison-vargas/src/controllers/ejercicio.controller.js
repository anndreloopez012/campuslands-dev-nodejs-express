import { listarLibros, crearLibro } from '../services/libros.service.js';
import { validarLibro } from '../validators/libro.validator.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'validacion de entrada',
  });
}

export async function obtenerLibros(req, res, next) {
  try {
    const libros = await listarLibros();

    return res.status(200).json({ ok: true, libros });
  } catch (error) {
    next(error);
  }
}

export async function crearNuevoLibro(req, res, next) {
  try {
    const { valido, errores } = validarLibro(req.body);

    if (!valido) {
      return res.status(400).json({ ok: false, errores });
    }

    const libro = await crearLibro(req.body);

    return res.status(201).json({ ok: true, libro });
  } catch (error) {
    next(error);
  }
}
