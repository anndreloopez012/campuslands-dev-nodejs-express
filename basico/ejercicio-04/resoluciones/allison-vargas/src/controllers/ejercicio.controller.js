// Controlador

import { obtenerResumenPartida, listarJugadores } from '../services/partida.service.js';

export function ejecutarEjercicio(req, res) {
  try {
    const partida = obtenerResumenPartida();

    return res.status(200).json({
      ok: true,
      message: 'Ejercicio ejecutado correctamente',
      topic: 'modulos ES Modules',
      partida,
    });
  } catch (error) {
    console.error('Error preparando la partida:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al ejecutar el ejercicio',
    });
  }
}

export function obtenerJugadores(req, res) {
  try {
    return res.status(200).json({
      ok: true,
      jugadores: listarJugadores(),
    });
  } catch (error) {
    console.error('Error listando jugadores:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al listar los jugadores',
    });
  }
}
