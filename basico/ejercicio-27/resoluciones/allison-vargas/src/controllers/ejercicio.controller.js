import { listarPartidas, crearPartida } from '../services/partidas.service.js';
import { validarPartida } from '../validators/partida.validator.js';
import { leerUltimasLineas } from '../utils/logger.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'logs simples',
  });
}

export async function obtenerPartidas(req, res, next) {
  try {
    const partidas = await listarPartidas();
    return res.status(200).json({ ok: true, partidas });
  } catch (error) {
    next(error);
  }
}

export async function crearNuevaPartida(req, res, next) {
  try {
    const { valido, errores } = validarPartida(req.body);

    if (!valido) {
      return res.status(400).json({ ok: false, errores });
    }

    const partida = await crearPartida(req.body);

    return res.status(201).json({ ok: true, partida });
  } catch (error) {
    next(error);
  }
}

export function obtenerLogsRecientes(req, res) {
  const cantidad = Number(req.query.cantidad) || 20;
  const lineas = leerUltimasLineas(cantidad);

  return res.status(200).json({ ok: true, lineas });
}
