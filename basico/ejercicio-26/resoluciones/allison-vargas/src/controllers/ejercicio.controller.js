import {
  listarJugadores,
  buscarJugadorPorId,
  crearJugador,
  listarColas,
  buscarColaPorId,
  nivelDeRango,
} from '../services/shooter.service.js';
import { validarJugador } from '../validators/jugador.validator.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'codigos de estado',
  });
}

export async function obtenerJugadores(req, res, next) {
  try {
    const jugadores = await listarJugadores();
    return res.status(200).json({ ok: true, jugadores });
  } catch (error) {
    next(error);
  }
}

export async function obtenerJugadorPorId(req, res, next) {
  try {
    const { id } = req.params;
    const jugador = await buscarJugadorPorId(id);

    if (!jugador) {
      return res.status(404).json({ ok: false, message: `No existe un jugador con id ${id}` });
    }

    return res.status(200).json({ ok: true, jugador });
  } catch (error) {
    next(error);
  }
}

export async function crearNuevoJugador(req, res, next) {
  try {
    const { valido, errores } = validarJugador(req.body);

    if (!valido) {
      return res.status(400).json({ ok: false, errores });
    }

    const jugador = await crearJugador(req.body);

    return res.status(201).json({ ok: true, jugador });
  } catch (error) {
    next(error);
  }
}

export async function obtenerColas(req, res, next) {
  try {
    const colas = await listarColas();
    return res.status(200).json({ ok: true, colas });
  } catch (error) {
    next(error);
  }
}

// Esta ruta va protegida por el middleware verificarApiKey (ver routes):
// si la ejecucion llega hasta aqui, ya sabemos quien es (paso el 401).
export async function unirseACola(req, res, next) {
  try {
    const { id } = req.params;
    const { jugadorId } = req.body;

    const cola = await buscarColaPorId(id);

    if (!cola) {
      return res.status(404).json({ ok: false, message: `No existe una cola con id ${id}` });
    }

    const jugador = await buscarJugadorPorId(jugadorId);

    if (!jugador) {
      return res.status(404).json({ ok: false, message: `No existe un jugador con id ${jugadorId}` });
    }

    if (nivelDeRango(jugador.rango) < nivelDeRango(cola.rango_minimo)) {
      // 403 Forbidden: identificado (paso el 401), pero no cumple el
      // rango minimo de esta cola.
      return res.status(403).json({
        ok: false,
        message: `${jugador.nombre} (${jugador.rango}) no cumple el rango minimo de "${cola.nombre}" (${cola.rango_minimo})`,
      });
    }

    return res.status(200).json({
      ok: true,
      message: `${jugador.nombre} se unio a "${cola.nombre}"`,
    });
  } catch (error) {
    next(error);
  }
}

// Ruta para forzar un error inesperado real, y comprobar que el
// middleware de errores (ver app.js) responde 500 sin exponer
// detalles internos al cliente.
export function forzarErrorServidor(req, res) {
  throw new Error('Fallo simulado en el servidor de matchmaking');
}
