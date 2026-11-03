const brushes = [
  { id: 1, name: 'Lapiz suave', sizePx: 4, opacity: 0.8, color: '#222222' },
  { id: 2, name: 'Aerografo', sizePx: 40, opacity: 0.3, color: '#ff5a5f' },
];

const info = (req, res) =>
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'middleware express.json',
  });

const middlewareOrder = (req, res) => res.json({ ok: true, requestId: req.id, trail: [...req.trail, 'ruta (controlador)'] });

// Muestra lo que express.json() dejo en req.body
const echo = (req, res) => res.json({ ok: true, receivedType: Array.isArray(req.body) ? 'array' : typeof req.body, body: req.body });

const list = (req, res) => res.json({ ok: true, total: brushes.length, brushes });

function validate(data) {
  const errors = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) return ['El cuerpo debe ser un objeto JSON'];
  if (typeof data.name !== 'string' || data.name.trim().length < 2 || data.name.length > 40) errors.push('name debe tener de 2 a 40 caracteres');
  if (!Number.isInteger(data.sizePx) || data.sizePx < 1 || data.sizePx > 500) errors.push('sizePx debe ser un entero entre 1 y 500');
  if (typeof data.opacity !== 'number' || data.opacity < 0 || data.opacity > 1) errors.push('opacity debe ser un numero entre 0 y 1');
  if (typeof data.color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(data.color)) errors.push('color debe tener formato #rrggbb');
  return errors;
}

function create(req, res) {
  const errors = validate(req.body);
  if (errors.length > 0) return res.status(400).json({ ok: false, message: 'Datos invalidos', errors });

  const { name, sizePx, opacity, color } = req.body;
  const brush = { id: brushes.reduce((max, item) => Math.max(max, item.id), 0) + 1, name: name.trim(), sizePx, opacity, color };
  brushes.push(brush);
  res.status(201).location(`/brushes/${brush.id}`).json({ ok: true, brush });
}

module.exports = { info, middlewareOrder, echo, list, create };
