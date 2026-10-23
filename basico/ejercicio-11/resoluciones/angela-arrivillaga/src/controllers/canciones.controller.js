import { obtenerCanciones, buscarCancion, obtenerArtistas } from '../services/canciones.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'promesas basicas'
  });
}

export function listar(req, res) {
  obtenerCanciones()
    .then((lista) => {
      res.json({ ok: true, data: lista });
    })
    .catch(() => {
      res.status(500).json({ ok: false, message: 'Error al obtener las canciones' });
    });
}

export function obtener(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un numero' });
  }

  buscarCancion(id)
    .then((cancion) => {
      res.json({ ok: true, data: cancion });
    })
    .catch((error) => {
      res.status(404).json({ ok: false, message: error.message });
    });
}

export function artistas(req, res) {
  obtenerArtistas()
    .then((lista) => {
      res.json({ ok: true, data: lista });
    })
    .catch(() => {
      res.status(500).json({ ok: false, message: 'Error al obtener los artistas' });
    });
}
