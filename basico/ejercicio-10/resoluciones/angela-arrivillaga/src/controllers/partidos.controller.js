import { obtenerJugadores, obtenerPartido, obtenerResumen } from '../services/partidos.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'funciones asincronas'
  });
}

export async function jugadores(req, res) {
  try {
    const lista = await obtenerJugadores();
    res.json({ ok: true, data: lista });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error al obtener los jugadores' });
  }
}

export async function partido(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un numero' });
  }

  try {
    const encontrado = await obtenerPartido(id);
    res.json({ ok: true, data: encontrado });
  } catch (error) {
    res.status(404).json({ ok: false, message: error.message });
  }
}

export async function resumen(req, res) {
  try {
    const datos = await obtenerResumen();
    res.json({ ok: true, data: datos });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error al obtener el resumen' });
  }
}
