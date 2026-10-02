import { filtrarTatuajes, buscarTatuaje, buscarArtista, tatuajesDeArtista } from '../services/tatuajes.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'req.params y req.query'
  });
}

export function listar(req, res) {
  const estilo = req.query.estilo;
  let precioMax = req.query.precioMax;

  if (precioMax !== undefined) {
    precioMax = Number(precioMax);

    if (Number.isNaN(precioMax)) {
      return res.status(400).json({ ok: false, message: 'precioMax debe ser un numero' });
    }
  }

  res.json({ ok: true, data: filtrarTatuajes(estilo, precioMax) });
}

export function obtener(req, res) {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un numero' });
  }

  const tatuaje = buscarTatuaje(id);

  if (!tatuaje) {
    return res.status(404).json({ ok: false, message: 'Tatuaje no encontrado' });
  }

  res.json({ ok: true, data: tatuaje });
}

export function porArtista(req, res) {
  const id = Number(req.params.id);
  const artista = buscarArtista(id);

  if (!artista) {
    return res.status(404).json({ ok: false, message: 'Artista no encontrado' });
  }

  res.json({ ok: true, artista: artista.nombre, data: tatuajesDeArtista(id) });
}
