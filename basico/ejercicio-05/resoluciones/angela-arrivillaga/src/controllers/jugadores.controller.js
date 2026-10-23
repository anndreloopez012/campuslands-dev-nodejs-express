import { leerTexto, leerJugadores } from '../services/jugadores.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'fs para leer archivos'
  });
}

export function archivo(req, res) {
  try {
    const texto = leerTexto();
    res.type('text/plain').send(texto);
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudo leer el archivo' });
  }
}

export function listar(req, res) {
  try {
    res.json({ ok: true, data: leerJugadores() });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudo leer el archivo' });
  }
}

export function obtener(req, res) {
  try {
    const nombre = req.params.nombre.toLowerCase();
    const jugadores = leerJugadores();
    const jugador = jugadores.find((j) => j.nombre.toLowerCase() === nombre);

    if (!jugador) {
      return res.status(404).json({ ok: false, message: 'Jugador no encontrado' });
    }

    res.json({ ok: true, data: jugador });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'No se pudo leer el archivo' });
  }
}
