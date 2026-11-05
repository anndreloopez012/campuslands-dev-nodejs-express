export const SIN_RUTA = 'sin_ruta';

export function crearMetricasHttp(registro) {
  const peticiones = registro.contador({
    nombre: 'http_peticiones_total',
    ayuda: 'Peticiones HTTP atendidas',
    etiquetas: ['metodo', 'ruta', 'status'],
  });
  const duracion = registro.histograma({
    nombre: 'http_duracion_segundos',
    ayuda: 'Duracion de las peticiones HTTP en segundos',
    etiquetas: ['metodo', 'ruta'],
  });
  const enCurso = registro.medidor({
    nombre: 'http_peticiones_en_curso',
    ayuda: 'Peticiones que todavia no terminan',
  });
  return { peticiones, duracion, enCurso };
}

const METODOS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);

// Express asigna req.route cuando una ruta atiende la peticion, pero si luego hay un
// error el router restaura req.baseUrl. Por eso el patron se guarda en el momento exacto
// en que se asigna la ruta.
function capturarPatron(req) {
  let ruta;
  let patron = null;
  Object.defineProperty(req, 'route', {
    configurable: true,
    enumerable: true,
    get: () => ruta,
    set: (valor) => {
      ruta = valor;
      patron = `${req.baseUrl}${valor.path}`.replace(/(.)\/$/, '$1');
    },
  });
  return () => patron;
}

export const middlewareMetricas = ({ http, ahora = () => process.hrtime.bigint() }) => (req, res, next) => {
  const inicio = ahora();
  const patron = capturarPatron(req);
  http.enCurso.inc();
  let cerrado = false;
  const terminar = () => {
    if (cerrado) return;
    cerrado = true;
    http.enCurso.dec();
    // se usa el patron de la ruta y no la url real para no crear una serie por cada id
    const ruta = patron() ?? SIN_RUTA;
    const metodo = METODOS.has(req.method) ? req.method : 'OTRO';
    const segundos = Number(ahora() - inicio) / 1e9;
    http.peticiones.inc({ metodo, ruta, status: String(res.statusCode) });
    http.duracion.observar({ metodo, ruta }, segundos);
  };
  res.on('finish', terminar);
  res.on('close', terminar);
  next();
};
