import { getSaltos, agregarSalto } from '../services/saltos.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'rutas POST'
  });
}

export function listar(req, res) {
  res.json({ ok: true, data: getSaltos() });
}

export function crear(req, res) {
  const body = req.body || {};
  const saltador = body.saltador;
  const altura = body.altura;
  const tipo = body.tipo;
  const tiposValidos = ['tandem', 'solo', 'acrobatico'];

  if (typeof saltador !== 'string' || saltador.trim() === '') {
    return res.status(400).json({ ok: false, message: 'El saltador es obligatorio' });
  }

  if (typeof altura !== 'number' || altura < 1000 || altura > 5000) {
    return res.status(400).json({ ok: false, message: 'La altura debe ser un numero entre 1000 y 5000 metros' });
  }

  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ ok: false, message: 'El tipo debe ser tandem, solo o acrobatico' });
  }

  const nuevo = agregarSalto(saltador.trim(), altura, tipo);
  res.status(201).json({ ok: true, data: nuevo });
}
