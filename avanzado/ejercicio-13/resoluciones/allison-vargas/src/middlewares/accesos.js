import { crearRedactor } from '../observabilidad/redaccion.js';

const { redactarUrl } = crearRedactor();

export function nivelPorStatus(status) {
  if (status >= 500) return 'error';
  if (status >= 400) return 'warn';
  return 'info';
}

export const registroDeAccesos = ({ ahora = () => process.hrtime.bigint(), omitir = [] } = {}) => (req, res, next) => {
  const ruta = req.originalUrl;
  if (omitir.some((prefijo) => ruta.startsWith(prefijo))) return next();
  const inicio = ahora();
  let registrado = false;

  function registrar(abortado) {
    if (registrado) return;
    registrado = true;
    const duracionMs = Math.round(Number(ahora() - inicio) / 1e4) / 100;
    const datos = {
      metodo: req.method,
      ruta: redactarUrl(ruta),
      status: abortado ? null : res.statusCode,
      duracionMs,
      bytes: Number(res.get('content-length')) || 0,
      ip: req.ip,
      agente: req.get('user-agent') ?? null,
    };
    if (req.route) datos.patron = `${req.baseUrl}${req.route.path}`;
    if (abortado) req.log.warn('http.abortada', datos);
    else req.log[nivelPorStatus(res.statusCode)]('http.respuesta', datos);
  }

  res.on('finish', () => registrar(false));
  res.on('close', () => registrar(!res.writableFinished));
  return next();
};
