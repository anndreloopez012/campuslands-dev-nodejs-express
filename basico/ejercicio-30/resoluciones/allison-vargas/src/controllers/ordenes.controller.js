import {
  listarOrdenes,
  listarOrdenesDeMoto,
  buscarOrdenPorId,
  crearOrdenParaMoto,
  actualizarEstadoOrden,
} from '../services/ordenes.service.js';
import { validarOrden, validarEstado } from '../validators/orden.validator.js';

export async function obtenerOrdenes(req, res, next) {
  try {
    const ordenes = await listarOrdenes();
    return res.status(200).json({ ok: true, ordenes });
  } catch (error) {
    next(error);
  }
}

export async function obtenerOrdenPorId(req, res, next) {
  try {
    const { id } = req.params;
    const orden = await buscarOrdenPorId(id);

    if (!orden) {
      return res.status(404).json({ ok: false, message: `No existe una orden con id ${id}` });
    }

    return res.status(200).json({ ok: true, orden });
  } catch (error) {
    next(error);
  }
}

export async function obtenerOrdenesDeMoto(req, res, next) {
  try {
    const { motoId } = req.params;
    const ordenes = await listarOrdenesDeMoto(motoId);

    return res.status(200).json({ ok: true, ordenes });
  } catch (error) {
    next(error);
  }
}

export async function crearOrdenDeMoto(req, res, next) {
  try {
    const { motoId } = req.params;
    const { valido, errores } = validarOrden(req.body);

    if (!valido) {
      return res.status(400).json({ ok: false, errores });
    }

    const orden = await crearOrdenParaMoto(motoId, req.body);

    return res.status(201).json({ ok: true, orden });
  } catch (error) {
    next(error);
  }
}

export async function cambiarEstadoOrden(req, res, next) {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const { valido, mensaje } = validarEstado(estado);

    if (!valido) {
      return res.status(400).json({ ok: false, message: mensaje });
    }

    const orden = await actualizarEstadoOrden(id, estado);

    if (!orden) {
      return res.status(404).json({ ok: false, message: `No existe una orden con id ${id}` });
    }

    return res.status(200).json({ ok: true, orden });
  } catch (error) {
    next(error);
  }
}
