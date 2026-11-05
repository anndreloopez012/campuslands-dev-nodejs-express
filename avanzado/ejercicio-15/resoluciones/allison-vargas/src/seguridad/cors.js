import { crear } from '../errores/index.js';

const PATRON_ORIGEN = /^https?:\/\/[a-z0-9.-]+(:\d{1,5})?$/;

export function validarOrigenes(origenes) {
  for (const origen of origenes) {
    if (origen === '*') throw new TypeError('No se permite "*" en la lista de origenes');
    if (!(origen instanceof RegExp) && !PATRON_ORIGEN.test(origen)) {
      throw new TypeError(`Origen mal escrito: ${origen}`);
    }
  }
  return origenes;
}

function agregarVary(res, valor) {
  const actual = res.get('Vary');
  if (!actual) return res.set('Vary', valor);
  const lista = actual.split(',').map((v) => v.trim().toLowerCase());
  if (!lista.includes(valor.toLowerCase())) res.set('Vary', `${actual}, ${valor}`);
  return res;
}

export function cors({
  origenes = [],
  metodos = ['GET', 'POST'],
  cabeceras = ['Content-Type'],
  expuestas = [],
  credenciales = false,
  maxAge = 600,
} = {}) {
  validarOrigenes(origenes);
  const permitido = (origen) => origenes.some((o) => (o instanceof RegExp ? o.test(origen) : o === origen));
  const metodosMayus = metodos.map((m) => m.toUpperCase());
  const cabecerasMinus = cabeceras.map((c) => c.toLowerCase());

  return (req, res, next) => {
    agregarVary(res, 'Origin');
    const origen = req.get('origin');
    const esPreflight = req.method === 'OPTIONS' && req.get('access-control-request-method') !== undefined;
    if (!origen) return next();

    if (!permitido(origen)) {
      // en una peticion simple no se agrega Access-Control-Allow-Origin y el navegador bloquea la lectura
      if (esPreflight) return next(crear('ORIGEN_NO_PERMITIDO', { origen }));
      return next();
    }

    res.set('Access-Control-Allow-Origin', origen);
    if (credenciales) res.set('Access-Control-Allow-Credentials', 'true');
    if (!esPreflight) {
      if (expuestas.length) res.set('Access-Control-Expose-Headers', expuestas.join(', '));
      return next();
    }

    const metodoPedido = req.get('access-control-request-method').toUpperCase();
    const cabecerasPedidas = (req.get('access-control-request-headers') ?? '')
      .split(',').map((c) => c.trim().toLowerCase()).filter(Boolean);
    const noPermitidas = cabecerasPedidas.filter((c) => !cabecerasMinus.includes(c));
    if (!metodosMayus.includes(metodoPedido) || noPermitidas.length) {
      return next(crear('PREFLIGHT_RECHAZADO', { metodo: metodoPedido, cabeceras: noPermitidas.join(', ') }));
    }
    agregarVary(res, 'Access-Control-Request-Method');
    agregarVary(res, 'Access-Control-Request-Headers');
    res.set({
      'Access-Control-Allow-Methods': metodosMayus.join(', '),
      'Access-Control-Allow-Headers': cabeceras.join(', '),
      'Access-Control-Max-Age': String(maxAge),
    });
    return res.status(204).end();
  };
}
