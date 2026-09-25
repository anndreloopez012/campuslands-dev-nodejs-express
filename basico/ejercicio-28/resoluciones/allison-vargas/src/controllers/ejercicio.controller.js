import { config } from '../config/index.js';
import { listarPartidas, crearPartida } from '../services/partidas.service.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'configuracion por entorno',
  });
}

// Endpoint de demostracion: muestra la configuracion activa segun
// el NODE_ENV con el que arranco el servidor.
export function obtenerConfigActiva(req, res) {
  return res.status(200).json({ ok: true, config });
}

export function obtenerPartidas(req, res) {
  const partidas = listarPartidas();
  return res.status(200).json({ ok: true, partidas });
}

// Aqui esta el otro foco: la misma validacion usa un limite DISTINTO
// dependiendo del entorno con el que corra el servidor.
export function crearNuevaPartida(req, res) {
  const { numero_jugadores } = req.body;

  if (typeof numero_jugadores !== 'number' || numero_jugadores < 1) {
    return res.status(400).json({
      ok: false,
      message: 'numero_jugadores es obligatorio y debe ser un numero mayor a 0',
    });
  }

  if (numero_jugadores > config.maxJugadoresPorPartida) {
    return res.status(400).json({
      ok: false,
      message: `numero_jugadores (${numero_jugadores}) excede el maximo permitido en el entorno "${config.entorno}" (${config.maxJugadoresPorPartida})`,
    });
  }

  const partida = crearPartida({ numero_jugadores });

  return res.status(201).json({ ok: true, partida });
}
