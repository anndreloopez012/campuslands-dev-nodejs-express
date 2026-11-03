import * as service from '../services/misiones.service.js';
import { validarAceptarMision } from '../validators/mision.validator.js';
import { AppError } from '../utils/AppError.js';

export const ejecutarEjercicio = (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'arquitectura por capas',
  });
};

export const listarPersonajes = (req, res) => {
  res.status(200).json({ ok: true, data: service.listarPersonajes() });
};

export const listarMisiones = (req, res) => {
  res.status(200).json({ ok: true, data: service.listarMisiones() });
};

export const aceptarMision = (req, res, next) => {
  try {
    const { valido, errores, misionId, personajeId } = validarAceptarMision(req.params, req.body);
    if (!valido) throw new AppError(errores.join('. '), 400);

    const data = service.aceptarMision(misionId, personajeId);
    res.status(201).json({ ok: true, message: 'Mision aceptada', data });
  } catch (error) {
    next(error);
  }
};
