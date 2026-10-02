import { buscarNave, convertirTexto } from '../services/naves.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'manejo de errores'
  });
}

export function obtener(req, res, next) {
  try {
    const id = Number(req.params.id);
    const nave = buscarNave(id);
    res.json({ ok: true, data: nave });
  } catch (error) {
    next(error);
  }
}

export function parsear(req, res, next) {
  try {
    const datos = convertirTexto(req.query.texto);
    res.json({ ok: true, data: datos });
  } catch (error) {
    next(error);
  }
}

export function fallar(req, res, next) {
  try {
    throw new Error('Fallo inesperado en el reactor');
  } catch (error) {
    next(error);
  }
}
