import {
  listarPartidos,
  buscarPartidoPorId,
  crearPartido,
} from '../services/partidos.service.js';
import { validarPartido } from '../validators/partido.validator.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'README tecnico',
  });
}

export async function obtenerPartidos(req, res, next) {
  try {
    const partidos = await listarPartidos();
    return res.status(200).json({ ok: true, partidos });
  } catch (error) {
    next(error);
  }
}

export async function obtenerPartidoPorId(req, res, next) {
  try {
    const { id } = req.params;
    const partido = await buscarPartidoPorId(id);

    if (!partido) {
      return res.status(404).json({ ok: false, message: `No existe un partido con id ${id}` });
    }

    return res.status(200).json({ ok: true, partido });
  } catch (error) {
    next(error);
  }
}

export async function crearNuevoPartido(req, res, next) {
  try {
    const { valido, errores } = validarPartido(req.body);

    if (!valido) {
      return res.status(400).json({ ok: false, errores });
    }

    const partido = await crearPartido(req.body);

    return res.status(201).json({ ok: true, partido });
  } catch (error) {
    next(error);
  }
}
