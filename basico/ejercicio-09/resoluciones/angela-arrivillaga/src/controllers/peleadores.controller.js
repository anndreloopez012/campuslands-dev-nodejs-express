import { leerPeleadores, agregarPeleador } from '../services/peleadores.service.js';

export function principal(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'JSON y persistencia simple'
  });
}

export function listar(req, res) {
  res.json({ ok: true, data: leerPeleadores() });
}

export function obtener(req, res) {
  const id = Number(req.params.id);
  const peleador = leerPeleadores().find((p) => p.id === id);

  if (!peleador) {
    return res.status(404).json({ ok: false, message: 'Peleador no encontrado' });
  }

  res.json({ ok: true, data: peleador });
}

export function crear(req, res) {
  const nombre = req.body.nombre;
  const peso = req.body.peso;
  const victorias = req.body.victorias;

  if (!nombre || typeof nombre !== 'string') {
    return res.status(400).json({ ok: false, message: 'El nombre es obligatorio' });
  }

  if (typeof peso !== 'number' || peso <= 0) {
    return res.status(400).json({ ok: false, message: 'El peso debe ser un numero mayor a 0' });
  }

  if (typeof victorias !== 'number' || victorias < 0) {
    return res.status(400).json({ ok: false, message: 'Las victorias deben ser un numero valido' });
  }

  const nuevo = agregarPeleador({ nombre, peso, victorias });
  res.status(201).json({ ok: true, data: nuevo });
}
