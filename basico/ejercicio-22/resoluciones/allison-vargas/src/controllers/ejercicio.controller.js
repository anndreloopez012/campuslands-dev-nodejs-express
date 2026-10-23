import {
  listarModelosConCosto,
  buscarModeloPorId,
  crearModelo,
  obtenerResumen,
} from '../services/modelos.service.js';
import { validarModelo } from '../validators/modelo.validator.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'servicios simples',
  });
}

export async function obtenerModelos(req, res, next) {
  try {
    const modelos = await listarModelosConCosto();
    return res.status(200).json({ ok: true, modelos });
  } catch (error) {
    next(error);
  }
}

export async function obtenerModeloPorId(req, res, next) {
  try {
    const { id } = req.params;
    const modelo = await buscarModeloPorId(id);

    if (!modelo) {
      return res.status(404).json({ ok: false, message: `No existe un modelo con id ${id}` });
    }

    return res.status(200).json({ ok: true, modelo });
  } catch (error) {
    next(error);
  }
}

export async function crearNuevoModelo(req, res, next) {
  try {
    const { valido, errores } = validarModelo(req.body);

    if (!valido) {
      return res.status(400).json({ ok: false, errores });
    }

    const modelo = await crearModelo(req.body);

    return res.status(201).json({ ok: true, modelo });
  } catch (error) {
    next(error);
  }
}

export async function obtenerResumenModelos(req, res, next) {
  try {
    const resumen = await obtenerResumen();
    return res.status(200).json({ ok: true, resumen });
  } catch (error) {
    next(error);
  }
}
