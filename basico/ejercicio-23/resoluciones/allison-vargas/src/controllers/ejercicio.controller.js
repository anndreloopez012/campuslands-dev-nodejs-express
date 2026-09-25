// NO hay await en ningun lado. Como los datos viven en memoria, todo es
// sincrono: no hay disco que leer ni nada que esperar.

import {
  listarSoldaduras,
  buscarSoldaduraPorId,
  crearSoldadura,
  actualizarSoldadura,
  eliminarSoldadura,
} from '../services/soldaduras.service.js';
import { validarSoldadura } from '../validators/soldadura.validator.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'datos en memoria',
  });
}

export function obtenerSoldaduras(req, res) {
  const soldaduras = listarSoldaduras();
  return res.status(200).json({ ok: true, soldaduras });
}

export function obtenerSoldaduraPorId(req, res) {
  const { id } = req.params;
  const soldadura = buscarSoldaduraPorId(id);

  if (!soldadura) {
    return res.status(404).json({ ok: false, message: `No existe una soldadura con id ${id}` });
  }

  return res.status(200).json({ ok: true, soldadura });
}

export function crearNuevaSoldadura(req, res) {
  const { valido, errores } = validarSoldadura(req.body);

  if (!valido) {
    return res.status(400).json({ ok: false, errores });
  }

  const soldadura = crearSoldadura(req.body);

  return res.status(201).json({ ok: true, soldadura });
}

export function actualizarSoldaduraExistente(req, res) {
  const { id } = req.params;
  const { valido, errores } = validarSoldadura(req.body);

  if (!valido) {
    return res.status(400).json({ ok: false, errores });
  }

  const soldadura = actualizarSoldadura(id, req.body);

  if (!soldadura) {
    return res.status(404).json({ ok: false, message: `No existe una soldadura con id ${id}` });
  }

  return res.status(200).json({ ok: true, soldadura });
}

export function eliminarSoldaduraExistente(req, res) {
  const { id } = req.params;
  const eliminada = eliminarSoldadura(id);

  if (!eliminada) {
    return res.status(404).json({ ok: false, message: `No existe una soldadura con id ${id}` });
  }

  return res.status(204).send();
}
