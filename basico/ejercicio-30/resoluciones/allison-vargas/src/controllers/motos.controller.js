import {
  listarMotos,
  buscarMotoPorId,
  crearMoto,
  actualizarMoto,
  eliminarMoto,
} from '../services/motos.service.js';
import { validarMoto } from '../validators/moto.validator.js';

export async function obtenerMotos(req, res, next) {
  try {
    const motos = await listarMotos();
    return res.status(200).json({ ok: true, motos });
  } catch (error) {
    next(error);
  }
}

export async function obtenerMotoPorId(req, res, next) {
  try {
    const { id } = req.params;
    const moto = await buscarMotoPorId(id);

    if (!moto) {
      return res.status(404).json({ ok: false, message: `No existe una moto con id ${id}` });
    }

    return res.status(200).json({ ok: true, moto });
  } catch (error) {
    next(error);
  }
}

export async function crearNuevaMoto(req, res, next) {
  try {
    const { valido, errores } = validarMoto(req.body);

    if (!valido) {
      return res.status(400).json({ ok: false, errores });
    }

    const moto = await crearMoto(req.body);

    return res.status(201).json({ ok: true, moto });
  } catch (error) {
    next(error);
  }
}

export async function actualizarMotoExistente(req, res, next) {
  try {
    const { id } = req.params;
    const { valido, errores } = validarMoto(req.body);

    if (!valido) {
      return res.status(400).json({ ok: false, errores });
    }

    const moto = await actualizarMoto(id, req.body);

    if (!moto) {
      return res.status(404).json({ ok: false, message: `No existe una moto con id ${id}` });
    }

    return res.status(200).json({ ok: true, moto });
  } catch (error) {
    next(error);
  }
}

export async function eliminarMotoExistente(req, res, next) {
  try {
    const { id } = req.params;
    const eliminada = await eliminarMoto(id);

    if (!eliminada) {
      return res.status(404).json({ ok: false, message: `No existe una moto con id ${id}` });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
