import { PermisoError } from '../utils/errors.js';

const lista = (valor) => (valor ?? '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);

export function cors(politica) {
  const { origenes, metodos, cabeceras, expuestas, credenciales, maxAge } = politica;
  const abierta = origenes === '*';

  return (req, res, next) => {
    res.vary('Origin');

    const origen = req.get('origin');
    if (!origen) return next();

    if (!abierta && !origenes.includes(origen)) {
      return next(new PermisoError(`El origen ${origen} no esta permitido`, 'ORIGEN_NO_PERMITIDO'));
    }

    const metodoSolicitado = req.get('access-control-request-method');
    const esPreflight = req.method === 'OPTIONS' && Boolean(metodoSolicitado);

    if (esPreflight) {
      res.vary('Access-Control-Request-Headers');

      if (!metodos.includes(metodoSolicitado.toUpperCase())) {
        return next(new PermisoError(`El metodo ${metodoSolicitado} no esta permitido por CORS en esta ruta`, 'METODO_CORS_NO_PERMITIDO'));
      }

      const rechazadas = lista(req.get('access-control-request-headers')).filter((nombre) => !cabeceras.includes(nombre));
      if (rechazadas.length) {
        return next(new PermisoError(`Cabeceras no permitidas por CORS: ${rechazadas.join(', ')}`, 'CABECERA_CORS_NO_PERMITIDA'));
      }

      res.set('Access-Control-Allow-Origin', abierta ? '*' : origen);
      if (credenciales) res.set('Access-Control-Allow-Credentials', 'true');
      res.set('Access-Control-Allow-Methods', metodos.join(', '));
      if (cabeceras.length) res.set('Access-Control-Allow-Headers', cabeceras.join(', '));
      res.set('Access-Control-Max-Age', String(maxAge));
      return res.status(204).end();
    }

    res.set('Access-Control-Allow-Origin', abierta ? '*' : origen);
    if (credenciales) res.set('Access-Control-Allow-Credentials', 'true');
    if (expuestas.length) res.set('Access-Control-Expose-Headers', expuestas.join(', '));
    return next();
  };
}
