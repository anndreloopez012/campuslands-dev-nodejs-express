const { Router } = require('express');
const { ejemplos } = require('../http/catalogo');

const router = Router();

// Estado del inventario local
const inventario = [
  { id: 1, nombre: 'Escudo Tactico', cantidad: 3 }
];
let consultasTorre = 0;

// GET /inventario -> 200
router.get('/inventario', (req, res) => {
  res.status(200).json({ ok: true, data: inventario });
});

// POST /loot -> 201 (nuevo recurso) y 415 si el Content-Type no es JSON
router.post('/loot', (req, res, next) => {
  if (!req.is('application/json')) {
    return res.status(415).json({ ok: false, message: 'Content-Type debe ser application/json' });
  }
  try {
    const { nombre } = req.body;
    if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 3) {
      const error = new Error('El campo "nombre" es obligatorio (min 3 caracteres)');
      error.statusCode = 400;
      return next(error);
    }
    const nuevo = { id: inventario.length + 1, nombre: nombre.trim(), cantidad: 1 };
    inventario.push(nuevo);
    return res.status(201).set('Location', `/inventario/${nuevo.id}`).json({ ok: true, message: 'Loot recogido', data: nuevo });
  } catch (error) {
    return next(error);
  }
});

// POST /torneo/inscripcion -> 202 (aceptado, se procesa luego)
router.post('/torneo/inscripcion', (req, res) => {
  res.status(202).json({ ok: true, message: 'Inscripcion en cola: llegada por orden de llegada, despues se confirma' });
});

// POST /torneo/registro -> 409 si la squad ya esta registrada
const registradas = new Set(['SquadX']);
router.post('/torneo/registro', (req, res) => {
  const id = String(req.body?.squad_id || '').trim();
  if (!id) return res.status(400).json({ ok: false, message: 'El campo "squad_id" es obligatorio' });

  if (registradas.has(id)) {
    return res.status(409).json({ ok: false, message: `La squad "${id}" ya esta registrada` });
  }
  registradas.add(id);
  return res.status(200).json({ ok: true, message: `Squad "${id}" registrada` });
});

// HEAD /ping y GET /opciones
router.get('/ping', (req, res) => res.status(200).json({ ok: true }));
router.head('/ping', (req, res) => res.status(200).set('X-Server-Uptime', String(process.uptime().toFixed(0)) + 's').end());
router.options('/opciones', (req, res) => {
  res.status(204)
    .set('Allow', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD')
    .end();
});

// PUT /inventario/1 -> reemplazo completo (exige ambos campos)
router.put('/inventario/:id', (req, res, next) => {
  const item = inventario.find((actual) => actual.id === Number(req.params.id));
  if (!item) return res.status(404).json({ ok: false, message: 'Item inexistente' });

  const { nombre, cantidad } = req.body || {};
  if (!nombre || !Number.isInteger(cantidad)) {
    const error = new Error('PUT reemplaza el recurso completo: envie "nombre" y "cantidad"');
    error.statusCode = 400;
    return next(error);
  }
  item.nombre = nombre.trim();
  item.cantidad = cantidad;
  return res.status(200).json({ ok: true, message: 'Item reemplazado (PUT)', data: item });
});

// PATCH /inventario/1 -> cambio parcial
router.patch('/inventario/:id', (req, res, next) => {
  const item = inventario.find((actual) => actual.id === Number(req.params.id));
  if (!item) return res.status(404).json({ ok: false, message: 'Item inexistente' });

  const { cantidad } = req.body || {};
  if (!Number.isInteger(cantidad)) {
    const error = new Error('PATCH cambia un campo: envie solo "cantidad"');
    error.statusCode = 400;
    return next(error);
  }
  item.cantidad = cantidad;
  return res.status(200).json({ ok: true, message: 'Cantidad actualizada (PATCH)', data: item });
});

// DELETE /inventario/1 -> 204 sin cuerpo
router.delete('/inventario/:id', (req, res) => {
  const indice = inventario.findIndex((actual) => actual.id === Number(req.params.id));
  if (indice === -1) return res.status(404).json({ ok: false, message: 'Item inexistente' });
  inventario.splice(indice, 1);
  return res.status(204).end();
});

// 401 y 403: distintos puntos que rompen el acceso
const tokenValido = 'escuadrilla-2026';
router.get('/zona-restringida', (req, res) => {
  const header = req.headers.authorization || '';
  const [esquema, token] = header.split(' ');
  if (esquema !== 'Bearer' || token !== tokenValido) {
    return res.status(401).json({ ok: false, message: 'Falta token: use Bearer ' + tokenValido });
  }
  return res.status(200).json({ ok: true, message: 'Zona visible con su token' });
});
router.get('/sala-vip', (req, res) => {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  if (token !== tokenValido) return res.status(401).json({ ok: false, message: 'Sin token: 401' });
  // Autenticado; el rol lo decide el servidor: quien no es "campeon" ve 403
  if (req.headers['x-rol'] !== 'campeon') {
    return res.status(403).json({ ok: false, message: 'Autenticado, pero requiere rol "campeon" (header x-rol)' });
  }
  return res.status(200).json({ ok: true, message: 'Bienvenido a la sala VIP' });
});

// 404 de recurso
router.get('/area/:id', (req, res) => {
  const idsValidos = [1, 2, 3];
  if (!idsValidos.includes(Number(req.params.id))) {
    return res.status(404).json({ ok: false, message: `El area ${req.params.id} no existe en el mapa` });
  }
  return res.status(200).json({ ok: true, data: { id: Number(req.params.id), nombre: `Cuadrante-${req.params.id}` } });
});

// 429 de ejemplo simulado con contador manual (max 2 por minuto)
router.get('/torre', (req, res) => {
  consultasTorre += 1;
  if (consultasTorre > 2) {
    return res.status(429).json({ ok: false, message: 'Limite de 2 consultas superado: reinicie el servidor para el demo' });
  }
  return res.status(200).json({ ok: true, mensaje: `Vista desde la torre (consulta ${consultasTorre}/2)` });
});

// GET /caja-vacia -> 200 con lista vacia: una respuesta exitosa SIN resultados
router.get('/caja-vacia', (req, res) => {
  res.status(200).json({ ok: true, message: 'La caja esta vacia pero la consulta fue correcta', data: [] });
});

module.exports = router;
