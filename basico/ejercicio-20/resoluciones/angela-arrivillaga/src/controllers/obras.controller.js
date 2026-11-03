import { getObras, agregarObra } from '../services/obras.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'middleware express.json'
  });
}

export function listar(req, res) {
  res.json({ ok: true, data: getObras() });
}

export function crear(req, res) {
  const body = req.body || {};
  const titulo = body.titulo;
  const tecnica = body.tecnica;
  const ancho = body.ancho;
  const alto = body.alto;

  if (typeof titulo !== 'string' || titulo.trim() === '') {
    return res.status(400).json({ ok: false, message: 'El titulo es obligatorio' });
  }

  if (typeof tecnica !== 'string' || tecnica.trim() === '') {
    return res.status(400).json({ ok: false, message: 'La tecnica es obligatoria' });
  }

  if (typeof ancho !== 'number' || ancho <= 0 || typeof alto !== 'number' || alto <= 0) {
    return res.status(400).json({ ok: false, message: 'El ancho y el alto deben ser numeros mayores a 0' });
  }

  const nueva = agregarObra(titulo.trim(), tecnica.trim(), ancho, alto);
  res.status(201).json({ ok: true, data: nueva });
}

export function eco(req, res) {
  res.json({ ok: true, recibido: req.body || {} });
}
